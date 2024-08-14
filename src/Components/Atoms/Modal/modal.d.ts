export type ModalProps = {
	children?: React.ReactNode;
	visible: boolean;
	size: string;
	closable: boolean;
	onCancel: (e: React.MouseEvent<HTMLElement>) => void;
	onOk: (e: React.MouseEvent<HTMLElement>) => void;
	okText: string;
	cancelText: string;
	titleText: string;
	descriptionText?: string;
	showFooter: boolean;
	className?: string;
};
