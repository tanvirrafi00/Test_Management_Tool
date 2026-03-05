'use client';

import { Card } from '../ui/Card';
import { ChevronRight, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FeatureCoverage({ features, loading }) {
  const router = useRouter();

  if (loading) {
    return (
      <Card className="p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Feature Test Coverage</h3>
        </div>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/4"></div>
              </div>
              <div className="h-8 w-16 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const handleFeatureClick = (featureId) => {
    router.push(`/features/${featureId}`);
  };

  const getCoverageColor = (coverage) => {
    if (coverage >= 80) return 'text-emerald-600 bg-emerald-50';
    if (coverage >= 60) return 'text-blue-600 bg-blue-50';
    if (coverage >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  const getCoverageBarColor = (coverage) => {
    if (coverage >= 80) return 'bg-emerald-500';
    if (coverage >= 60) return 'bg-blue-500';
    if (coverage >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Feature Test Coverage</h3>
        </div>
      </div>

      {!features || features.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="h-12 w-12 text-gray-200 mb-4" />
          <p className="text-sm text-gray-500 mb-2">No features yet</p>
          <p className="text-xs text-gray-400">Create features to track coverage</p>
        </div>
      ) : (
        <div className="space-y-4">
          {features.slice(0, 6).map((feature) => {
            const coverage = feature.totalTests > 0 
              ? Math.round((feature.executed / feature.totalTests) * 100) 
              : 0;
            
            return (
              <div
                key={feature._id}
                onClick={() => handleFeatureClick(feature._id)}
                className="group cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 -mx-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                      {feature.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {feature.executed} / {feature.totalTests} tests executed
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getCoverageColor(coverage)}`}>
                      {coverage}%
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getCoverageBarColor(coverage)}`}
                    style={{ width: `${coverage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
