export default function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 flex justify-between items-center animate-pulse">
      <div className="flex items-center gap-4 w-full">
        
        <div className="w-12 h-12 bg-slate-200 rounded-2xl shrink-0"></div>
        
        <div className="flex-1 space-y-3">
          
          <div className="h-4 bg-slate-200 rounded-full w-48"></div>
          
          <div className="h-3 bg-slate-100 rounded-full w-32"></div>
        </div>
      </div>
      
      
      <div className="w-10 h-10 bg-slate-100 rounded-2xl shrink-0"></div>
    </div>
  );
}

