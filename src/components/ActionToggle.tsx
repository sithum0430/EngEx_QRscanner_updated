import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, LogOut } from 'lucide-react';

interface ActionToggleProps {
  action: 'entry' | 'exit';
  onActionChange: (action: 'entry' | 'exit') => void;
}

export const ActionToggle = ({ action, onActionChange }: ActionToggleProps) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Action Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={action === 'entry' ? 'default' : 'outline'}
            onClick={() => onActionChange('entry')}
            className="flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Entry
          </Button>
          <Button
            variant={action === 'exit' ? 'default' : 'outline'}
            onClick={() => onActionChange('exit')}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Exit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};