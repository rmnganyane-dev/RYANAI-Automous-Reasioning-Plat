import { Info } from 'lucide-react';
import Modal from './Modal';

interface AboutModalProps {
	open: boolean;
	onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
	return (
		<Modal open={open} onClose={onClose} title="About RYANAI Platform" icon={<Info size={16} />}>
			<p className="text-sm text-gray-300">RYANAI Autonomous Reasoning Platform.</p>
		</Modal>
	);
}
