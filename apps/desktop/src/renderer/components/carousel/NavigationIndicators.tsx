import React from 'react';
import { NavigationIndicatorProps } from './types';
import './NavigationIndicators.css';

export const NavigationIndicators: React.FC<NavigationIndicatorProps> = ({
  subdomains,
  activeIndex,
  onNavigate
}) => {
  return (
    <nav className="carousel-navigation" role="tablist" aria-label="Subdomain navigation">
      <div className="carousel-navigation-tabs">
        {subdomains.map((subdomain, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={subdomain.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${subdomain.id}`}
              id={`tab-${subdomain.id}`}
              className={`carousel-tab ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(index)}
              style={{
                borderBottomColor: isActive ? subdomain.color : 'transparent'
              }}
              title={`${subdomain.title} (${subdomain.shortcut || `Ctrl+${index + 1}`})`}
            >
              {subdomain.icon && <span className="carousel-tab-icon">{subdomain.icon}</span>}
              <span className="carousel-tab-title">{subdomain.name}</span>
              {subdomain.shortcut && (
                <span className="carousel-tab-shortcut">{subdomain.shortcut}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Animated indicator bar */}
      <div
        className="carousel-indicator-bar"
        style={{
          transform: `translateX(${(activeIndex * 100) / subdomains.length}%)`,
          width: `${100 / subdomains.length}%`,
          backgroundColor: subdomains[activeIndex]?.color || '#3b82f6'
        }}
      />

      {/* Dot indicators (alternative/additional) */}
      <div className="carousel-dots" role="presentation">
        {subdomains.map((subdomain, index) => (
          <button
            key={`dot-${subdomain.id}`}
            className={`carousel-dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => onNavigate(index)}
            aria-label={`Go to ${subdomain.name}`}
            style={{
              backgroundColor: index === activeIndex ? subdomain.color : undefined
            }}
          />
        ))}
      </div>
    </nav>
  );
};
