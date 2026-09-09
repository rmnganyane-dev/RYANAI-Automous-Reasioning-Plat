import { Github } from 'lucide-react';
import Modal from './Modal';

interface GithubModalProps {
	open: boolean;
	onClose: () => void;
	connected: boolean;
}

export default function GithubModal({ open, onClose, connected }: GithubModalProps) {
	return (
		<Modal open={open} onClose={onClose} title="GitHub Repository" icon={<Github size={16} />}>
			<div className="space-y-4 text-sm text-gray-300">
				<p>Access source code and system documentation for the RYANAI Platform.</p>
				<p className="text-xs text-gray-400">Status: {connected ? 'Connected' : 'Not connected'}</p>
				<a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">
					View on GitHub
				</a>
			</div>
		</Modal>
	);
}
