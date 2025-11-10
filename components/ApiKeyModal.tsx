import React from 'react';

interface ApiKeyModalProps {
    onKeySubmit: (key: string) => void;
    onClose: () => void;
}

// FIX: This component is no longer used as API keys are handled by environment variables.
// Returning null to effectively disable it without removing the file.
const ApiKeyModal: React.FC<ApiKeyModalProps> = () => {
    return null;
};

export default ApiKeyModal;
