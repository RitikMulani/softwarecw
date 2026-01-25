import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TurtleAvatar from '../TurtleAvatar';

describe('TurtleAvatar Component', () => {
  const mockMetrics = {
    heartRate: 72,
    steps: 8500,
    stressScore: 35
  };

  describe('Rendering', () => {
    test('renders turtle avatar with correct mood', () => {
      render(<TurtleAvatar stressScore={25} metrics={mockMetrics} />);
      
      const avatar = screen.getByRole('button', { name: /turtle avatar/i });
      expect(avatar).toBeInTheDocument();
    });

    test('displays mood message for low stress', () => {
      render(<TurtleAvatar stressScore={25} metrics={mockMetrics} />);
      
      expect(screen.getByText(/you're doing great/i)).toBeInTheDocument();
    });

    test('displays SVG turtle graphic', () => {
      const { container } = render(<TurtleAvatar stressScore={40} metrics={mockMetrics} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Mood States', () => {
    test('shows happy mood for stress < 30', () => {
      const { container } = render(<TurtleAvatar stressScore={20} metrics={mockMetrics} />);
      
      expect(screen.getByText(/doing great/i)).toBeInTheDocument();
      const moodFace = container.querySelector('.mood-face');
      expect(moodFace).toHaveTextContent('😊');
    });

    test('shows neutral mood for stress 30-50', () => {
      const { container } = render(<TurtleAvatar stressScore={40} metrics={mockMetrics} />);
      
      expect(screen.getByText(/you're steady/i)).toBeInTheDocument();
      const moodFace = container.querySelector('.mood-face');
      expect(moodFace).toHaveTextContent('😐');
    });

    test('shows worried mood for stress 50-70', () => {
      const { container } = render(<TurtleAvatar stressScore={60} metrics={mockMetrics} />);
      
      expect(screen.getByText(/little tense/i)).toBeInTheDocument();
      const moodFace = container.querySelector('.mood-face');
      expect(moodFace).toHaveTextContent('😟');
    });

    test('shows stressed mood for stress >= 70', () => {
      const { container } = render(<TurtleAvatar stressScore={80} metrics={mockMetrics} />);
      
      expect(screen.getByText(/take a deep breath/i)).toBeInTheDocument();
      const moodFace = container.querySelector('.mood-face');
      expect(moodFace).toHaveTextContent('😰');
    });
  });

  describe('Interactive Q&A', () => {
    test('does not show question dialog initially', () => {
      render(<TurtleAvatar stressScore={40} metrics={mockMetrics} />);
      
      expect(screen.queryByText(/how much water should i drink/i)).not.toBeInTheDocument();
    });

    test('shows question dialog when turtle is clicked', () => {
      render(<TurtleAvatar stressScore={40} metrics={mockMetrics} />);
      
      const avatar = screen.getByRole('button', { name: /turtle avatar/i });
      fireEvent.click(avatar);
      
      expect(screen.getByText(/how much water should i drink/i)).toBeInTheDocument();
      expect(screen.getByText(/why is my heart rate high/i)).toBeInTheDocument();
      expect(screen.getByText(/how to lower stress/i)).toBeInTheDocument();
    });

    test('provides personalized answer when question is clicked', () => {
      render(<TurtleAvatar stressScore={40} metrics={{ heartRate: 85, steps: 5000, stressScore: 40 }} />);
      
      const avatar = screen.getByRole('button', { name: /turtle avatar/i });
      fireEvent.click(avatar);
      
      const heartRateQuestion = screen.getByText(/why is my heart rate high/i);
      fireEvent.click(heartRateQuestion);
      
      expect(screen.getByText(/your current heart rate is 85 bpm/i)).toBeInTheDocument();
    });

    test('closes dialog when close button is clicked', () => {
      render(<TurtleAvatar stressScore={40} metrics={mockMetrics} />);
      
      // Open dialog
      const avatar = screen.getByRole('button', { name: /turtle avatar/i });
      fireEvent.click(avatar);
      
      expect(screen.getByText(/how much water should i drink/i)).toBeInTheDocument();
      
      // Close dialog
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(screen.queryByText(/how much water should i drink/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper aria-label for screen readers', () => {
      render(<TurtleAvatar stressScore={40} metrics={mockMetrics} />);
      
      const avatar = screen.getByRole('button', { name: /turtle avatar/i });
      expect(avatar).toHaveAttribute('aria-label');
    });

    test('dialog has proper role when opened', () => {
      render(<TurtleAvatar stressScore={40} metrics={mockMetrics} />);
      
      const avatar = screen.getByRole('button');
      fireEvent.click(avatar);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Dynamic Content', () => {
    test('water recommendation uses steps data', () => {
      render(<TurtleAvatar stressScore={40} metrics={{ heartRate: 72, steps: 12000, stressScore: 40 }} />);
      
      const avatar = screen.getByRole('button');
      fireEvent.click(avatar);
      
      const waterQuestion = screen.getByText(/how much water should i drink/i);
      fireEvent.click(waterQuestion);
      
      expect(screen.getByText(/12000 steps/i)).toBeInTheDocument();
    });

    test('stress advice reflects current stress level', () => {
      render(<TurtleAvatar stressScore={75} metrics={mockMetrics} />);
      
      const avatar = screen.getByRole('button');
      fireEvent.click(avatar);
      
      const stressQuestion = screen.getByText(/how to lower stress/i);
      fireEvent.click(stressQuestion);
      
      expect(screen.getByText(/your stress is at 75/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles missing metrics gracefully', () => {
      render(<TurtleAvatar stressScore={40} metrics={{}} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('handles extreme stress values', () => {
      render(<TurtleAvatar stressScore={100} metrics={mockMetrics} />);
      
      expect(screen.getByText(/take a deep breath/i)).toBeInTheDocument();
    });

    test('handles zero stress', () => {
      render(<TurtleAvatar stressScore={0} metrics={mockMetrics} />);
      
      expect(screen.getByText(/doing great/i)).toBeInTheDocument();
    });
  });
});
