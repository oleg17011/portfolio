const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const multer = require('multer');
const crypto = require('crypto');
const Project = require('../models/Project');
const { verifyToken, verifyTokenOptional } = require('../middleware/middleware_auth');

// ====================== MULTER CONFIG ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Лимит 15 МБ
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'diploma') {
      const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.png', '.webp'];
      return allowed.includes(path.extname(file.originalname).toLowerCase()) 
        ? cb(null, true) 
        : cb(new Error('Недопустимый формат диплома'));
    }
    if (file.fieldname === 'codeFiles') {
      const allowed = ['.js', '.py', '.java', '.cpp', '.c', '.html', '.css', '.json', '.txt', '.ts'];
      return allowed.includes(path.extname(file.originalname).toLowerCase()) 
        ? cb(null, true) 
        : cb(new Error('Недопустимый формат файла кода'));
    }
    cb(null, true);
  },
});

const uploadFields = upload.fields([
  { name: 'diploma', maxCount: 1 },
  { name: 'codeFiles', maxCount: 15 }
]);

// ====================== ROUTES ======================

// 1. Получить список проектов (с учетом приватности и ролей)
router.get('/', verifyTokenOptional, async (req, res) => {
  try {
    let query = { isPublic: true };
    
    if (req.user) {
      if (req.user.role === 'admin') {
        query = {}; // Администратор видит абсолютно всё
      } else {
        // Обычный пользователь видит публичные ИЛИ свои собственные проекты
        query = { 
          $or: [
            { isPublic: true }, 
            { owner: req.user._id } 
          ] 
        };
      }
    }
    
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate('owner', 'name email avatar');
      
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера при получении проектов' });
  }
});

// 2. Создать новый проект (автоматическая привязка к владельцу)
router.post('/', verifyToken, uploadFields, async (req, res) => {
  try {
    const { title, description, technologies, isPublic, isFeatured } = req.body;
    
    let codeFiles = [];
    if (req.body.codeFiles) {
      try { codeFiles = JSON.parse(req.body.codeFiles); } catch (e) {}
    }

    // Обработка загруженных через форму файлов кода
    const uploaded = (req.files?.['codeFiles'] || []).map(file => ({
      fileId: crypto.randomUUID(), 
      name: file.originalname,
      language: path.extname(file.originalname).slice(1),
      content: '', 
      fileUrl: `/uploads/${file.filename}`
    }));

    const newProject = new Project({
      title: title ? title.trim() : '',
      description: description ? description.trim() : '',
      technologies: typeof technologies === 'string' 
        ? technologies.split(',').map(s => s.trim()) 
        : (Array.isArray(technologies) ? technologies : []),
      isPublic: isPublic === 'true' || isPublic === true,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      owner: req.user._id, // Привязываем id из токена авторизации
      diplomaUrl: req.files?.['diploma'] ? `/uploads/${req.files['diploma'][0].filename}` : '',
      codeFiles: [...codeFiles, ...uploaded]
    });

    const saved = await newProject.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. Обновить основную информацию о проекте + добавить новые файлы
router.put('/:id', verifyToken, uploadFields, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Проект не найден' });
    
    // Проверка прав доступа (Владелец проекта или Администратор)
    if (String(project.owner) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'У вас нет прав на редактирование этого проекта' });
    }

    const { title, description, technologies, isPublic, isFeatured } = req.body;
    
    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (technologies) {
      project.technologies = Array.isArray(technologies) 
        ? technologies 
        : technologies.split(',').map(s => s.trim());
    }
    if (isPublic !== undefined) project.isPublic = isPublic === 'true' || isPublic === true;
    if (isFeatured !== undefined) project.isFeatured = isFeatured === 'true' || isFeatured === true;

    // Добавление новых файлов кода, если они прикреплены
    if (req.files?.['codeFiles']) {
      const addedFiles = req.files['codeFiles'].map(file => ({
        fileId: crypto.randomUUID(),
        name: file.originalname,
        language: path.extname(file.originalname).slice(1),
        content: '',
        fileUrl: `/uploads/${file.filename}`
      }));
      project.codeFiles.push(...addedFiles);
    }
    
    // Обновление файла диплома
    if (req.files?.['diploma']) {
      project.diplomaUrl = `/uploads/${req.files['diploma'][0].filename}`;
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. Обновить текстовое содержимое конкретного файла кода (по fileId)
router.put('/:projectId/code/:fileId', verifyToken, async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    const { content } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Проект не найден' });
    
    if (String(project.owner) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'У вас нет прав на изменение файлов этого проекта' });
    }

    const file = project.codeFiles.find(f => f.fileId === fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден в проекте' });

    file.content = content || '';
    await project.save();
    res.json({ message: 'Содержимое файла успешно обновлено', codeFiles: project.codeFiles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Удалить конкретный файл кода из проекта (по fileId)
router.delete('/:projectId/code/:fileId', verifyToken, async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Проект не найден' });
    
    if (String(project.owner) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'У вас нет прав на удаление файлов этого проекта' });
    }

    project.codeFiles = project.codeFiles.filter(f => f.fileId !== fileId);
    await project.save();
    res.json({ message: 'Файл успешно удален', codeFiles: project.codeFiles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Полностью удалить проект
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Проект не найден' });
    
    if (String(project.owner) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'У вас нет прав на удаление этого проекта' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Проект успешно удалён' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. Локальная кроссплатформенная песочница для запуска кода (JS, Python, C++)
router.post('/run-sandbox', verifyToken, async (req, res) => {
  const { code, language } = req.body;
  const tempDir = path.join(__dirname, '../temp');
  
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  // Защитная проверка на случай отсутствия или пустоты кода
  if (!code || typeof code !== 'string') {
    return res.status(200).json({ success: false, output: '[Ошибка]: Код пуст или отсутствует.' });
  }

  const fileId = crypto.randomUUID();
  let sourceFile = '';
  let compileCommand = '';
  let runCommand = '';

  // Кроссплатформенность: определяем ОС (Windows — 'win32')
  const isWin = process.platform === 'win32';
  const pythonCmd = isWin ? 'python' : 'python3';
  const exeExt = isWin ? '.exe' : '.out';

  try {
    switch (language) {
      case 'javascript':
        sourceFile = path.join(tempDir, `${fileId}.js`);
        fs.writeFileSync(sourceFile, code);
        runCommand = `node "${sourceFile}"`;
        break;
      case 'python':
        sourceFile = path.join(tempDir, `${fileId}.py`);
        fs.writeFileSync(sourceFile, code);
        runCommand = `${pythonCmd} "${sourceFile}"`; 
        break;
      case 'cpp':
        sourceFile = path.join(tempDir, `${fileId}.cpp`);
        const exeFile = path.join(tempDir, `${fileId}${exeExt}`); 
        fs.writeFileSync(sourceFile, code);
        compileCommand = `g++ "${sourceFile}" -o "${exeFile}"`;
        runCommand = `"${exeFile}"`;
        break;
      default:
        return res.status(400).json({ message: 'Выбранный язык не поддерживается локальной песочницей' });
    }

    // Функция обертка над exec, изолирующая потоки данных
    const execute = (cmd) => new Promise((resolve) => {
      exec(cmd, { timeout: 3000 }, (err, stdout, stderr) => {
        resolve({
          err: err,
          stdout: stdout ? stdout.trim() : '',
          stderr: stderr ? stderr.trim() : ''
        });
      });
    });

    let output = '';
    let success = true;
    
    if (language === 'cpp') {
      // Компиляция C++
      const compileResult = await execute(compileCommand);
      if (compileResult.err || compileResult.stderr) {
        output = compileResult.stderr || compileResult.err.message;
        success = false;
      } else {
        // Запуск скомпилированного бинарника C++
        const runResult = await execute(runCommand);
        output = runResult.stdout || runResult.stderr || (runResult.err ? runResult.err.message : '');
        success = !runResult.err;
      }
      
      // Удаляем исполняемый файл (.exe или .out)
      const outPath = path.join(tempDir, `${fileId}${exeExt}`);
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    } else {
      // Запуск скриптов (JS / Python)
      const runResult = await execute(runCommand);
      output = runResult.stdout || runResult.stderr || (runResult.err ? runResult.err.message : '');
      success = !runResult.err;
    }

    // Удаляем исходный файл с кодом
    if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile);
    
    // Возвращаем статус 200, чтобы Axios обрабатывал ответ в блоке .then() вместо .catch()
    res.json({ 
      success: success, 
      output: output ? output : '[Программа завершилась без вывода текста]' 
    });

  } catch (err) {
    // Чистим остаточные файлы в случае системного сбоя Node.js
    if (sourceFile && fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile);
    const outPath = path.join(tempDir, `${fileId}${exeExt}`);
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

    // Изменено на статус 200, чтобы фронтенд вывел ошибку окружения в окно консоли, а не падал в глухую ошибку 500
    res.status(200).json({ success: false, output: 'Критическая ошибка окружения сервера: ' + err.message });
  }
});

module.exports = router;