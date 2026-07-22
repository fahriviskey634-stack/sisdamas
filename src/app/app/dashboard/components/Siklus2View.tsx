import React, { useState } from 'react';
import SurveyWizardView from './SurveyWizardView';
import MapView from './MapView';

export default function Siklus2View({ updateDraftCount, currentUser }: any) {
  const [subTab, setSubTab] = useState<'form' | 'map'>('form');

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200/80 gap-6">
        <button
          onClick={() => setSubTab('form')}
          className={`pb-3 font-bold text-xs uppercase tracking-wider relative transition cursor-pointer ${
            subTab === 'form' ? 'text-teal-sedang' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Formulir Kuesioner Sensus
          {subTab === 'form' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-sedang rounded" />}
        </button>
        <button
          onClick={() => setSubTab('map')}
          className={`pb-3 font-bold text-xs uppercase tracking-wider relative transition cursor-pointer ${
            subTab === 'map' ? 'text-teal-sedang' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Peta Sebaran GIS Tematik
          {subTab === 'map' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-sedang rounded" />}
        </button>
      </div>

      {subTab === 'form' ? (
        <SurveyWizardView updateDraftCount={updateDraftCount} currentUser={currentUser} />
      ) : (
        <MapView />
      )}
    </div>
  );
}
