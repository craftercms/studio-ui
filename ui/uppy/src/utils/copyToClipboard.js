export default function copyToClipboard(textToCopy, fallbackString = 'Copy the URL below') {
	return new Promise((resolve) => {
		const textArea = document.createElement('textarea');
		textArea.setAttribute('style', {
			position: 'fixed',
			top: 0,
			left: 0,
			width: '2em',
			height: '2em',
			padding: 0,
			border: 'none',
			outline: 'none',
			boxShadow: 'none',
			background: 'transparent'
		});

		textArea.value = textToCopy;
		document.body.appendChild(textArea);
		textArea.select();

		const magicCopyFailed = () => {
			document.body.removeChild(textArea);
			window.prompt(fallbackString, textToCopy);
			resolve();
		};

		try {
			const successful = document.execCommand('copy');
			if (!successful) {
				return magicCopyFailed();
			}
			document.body.removeChild(textArea);
			return resolve();
		} catch (_err) {
			document.body.removeChild(textArea);
			return magicCopyFailed();
		}
	});
}
