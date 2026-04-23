'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, User } from 'lucide-react';

interface Organization {
    id: string; // The URN
    name: string;
}

interface LinkedInTargetSelectorProps {
    connectionId: string;
    managedOrganizations?: Organization[];
    defaultTarget?: string; // URN or 'personal'
    onSave?: (targetId: string) => Promise<void>;
    userTier: string;
}

export function LinkedInTargetSelector({
    connectionId,
    managedOrganizations = [],
    defaultTarget = 'personal',
    onSave,
    userTier,
}: LinkedInTargetSelectorProps) {
    const [target, setTarget] = useState(defaultTarget);
    const [isSaving, setIsSaving] = useState(false);

    if (managedOrganizations.length === 0) {
        return (
            <div className="text-sm text-zinc-500 flex flex-col gap-2">
                <span><User className="w-4 h-4 inline mr-1" /> Connected to Personal Profile.</span>
                <span className="text-xs">No business pages detected or permission not granted.</span>
            </div>
        );
    }

    const handleChange = async (val: string) => {
        setTarget(val);
        if (onSave) {
            setIsSaving(true);
            try {
                await onSave(val);
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Default Posting Target
                </label>
                {userTier === 'free' && (
                    <Badge variant="secondary" className="text-[10px]">
                        Global Setting
                    </Badge>
                )}
            </div>
            
            <div className="flex gap-3 items-center">
                <Select value={target} onValueChange={handleChange} disabled={isSaving}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select target..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="personal">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-zinc-500" />
                                <span>Personal Profile</span>
                            </div>
                        </SelectItem>
                        {managedOrganizations.map(org => (
                            <SelectItem key={org.id} value={org.id}>
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-zinc-500" />
                                    <span>{org.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {isSaving && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
            </div>
            
            {userTier === 'free' ? (
                <p className="text-xs text-zinc-500">
                    Free plan users must set a global target here. Upgrade to Pro to choose per-post when scheduling.
                </p>
            ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    As a Pro user, you can also override this choice per-post.
                </p>
            )}
        </div>
    );
}
