import { Card } from '../ui/Card';
import { Folder, FileText, ClipboardList, AlertTriangle, ChevronRight } from 'lucide-react';

export default function ProjectCard({ project, onClick }) {
    return (
        <Card
            className="p-5 hover:bg-gray-50/80 transition-all cursor-pointer border-gray-100 hover:border-gray-200 group relative bg-white rounded-2xl overflow-hidden mb-3 shadow-sm hover:shadow-md border border-solid"
            onClick={() => onClick(project._id)}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary-600 group-hover:from-primary-50 group-hover:to-primary-100 transition-all duration-300 shadow-inner">
                        <Folder className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[15px] font-bold text-gray-900 truncate tracking-tight mb-0.5 group-hover:text-primary-600 transition-colors duration-300">
                            {project.name}
                        </h3>
                        <div className="flex items-center space-x-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <span className="flex items-center bg-gray-50 px-1.5 py-0.5 rounded-md">
                                {project.totalTestCases} TC
                            </span>
                            <span className="flex items-center bg-gray-50 px-1.5 py-0.5 rounded-md">
                                {project.totalTestPlans} Plans
                            </span>
                            {project.openDefects > 0 && (
                                <span className="flex items-center text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">
                                    {project.openDefects} Defects
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-6 flex-shrink-0">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-gray-900 tabular-nums">{project.progress}%</span>
                        <div className="w-16 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                            <div
                                className="h-full bg-primary-600 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${project.progress}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </Card>
    );
}
