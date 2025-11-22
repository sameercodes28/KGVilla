import { render, screen } from '@testing-library/react';
import { PhaseSection } from './PhaseSection';
import { initialCostItems } from '@/data/projectData';
import '@testing-library/jest-dom';

// Mock the Translation Context
jest.mock('@/contexts/LanguageContext', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('PhaseSection', () => {
  it('renders without crashing and has valid structure', () => {
    render(
      <PhaseSection 
        title="Test Phase" 
        totalCost={1000} 
        items={initialCostItems} 
        onUpdateItem={() => {}} 
        onHoverItem={() => {}}
      />
    );
    
    const title = screen.getByText('Test Phase');
    expect(title).toBeInTheDocument();
    
    // Check if button is actually a div with role button (the fix we implemented)
    const button = screen.getByRole('button');
    expect(button.tagName).toBe('DIV'); 
  });
});
