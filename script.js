document.addEventListener('DOMContentLoaded', () => {
	const lengthRange = document.getElementById('length');
	const lengthNumber = document.getElementById('lengthNumber');
	const lowerChk = document.getElementById('lower');
	const upperChk = document.getElementById('upper');
	const numbersChk = document.getElementById('numbers');
	const symbolsChk = document.getElementById('symbols');
	const generateBtn = document.getElementById('generate');
	const copyBtn = document.getElementById('copy');
	const passwordInput = document.getElementById('password');
	const strengthBar = document.getElementById('strengthBar');

	// keep range and number synced
	lengthRange.addEventListener('input', () => {
		lengthNumber.value = lengthRange.value;
	});
	lengthNumber.addEventListener('input', () => {
		let v = parseInt(lengthNumber.value) || 4;
		if (v < 4) v = 4;
		if (v > 64) v = 64;
		lengthNumber.value = v;
		lengthRange.value = v;
	});

	function getRandomInt(max) {
		const array = new Uint32Array(1);
		window.crypto.getRandomValues(array);
		return array[0] % max;
	}

	function pickRandom(str) {
		return str.charAt(getRandomInt(str.length));
	}

	function generatePassword(length, opts) {
		const lower = 'abcdefghijklmnopqrstuvwxyz';
		const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const numbers = '0123456789';
		const symbols = '!@#$%^&*()-_=+[]{};:,.<>/?~';

		let pool = '';
		const required = [];
		if (opts.lower) {
			pool += lower;
			required.push(pickRandom(lower));
		}
		if (opts.upper) {
			pool += upper;
			required.push(pickRandom(upper));
		}
		if (opts.numbers) {
			pool += numbers;
			required.push(pickRandom(numbers));
		}
		if (opts.symbols) {
			pool += symbols;
			required.push(pickRandom(symbols));
		}

		if (!pool.length) return '';

		const remaining = length - required.length;
		const result = [];
		for (let i = 0; i < remaining; i++) {
			result.push(pickRandom(pool));
		}

		// combine required and random chars and shuffle
		const combined = required.concat(result);
		for (let i = combined.length - 1; i > 0; i--) {
			const j = getRandomInt(i + 1);
			const tmp = combined[i];
			combined[i] = combined[j];
			combined[j] = tmp;
		}

		return combined.join('');
	}

	function calculateStrength(pw) {
		let score = 0;
		if (!pw) return { score: 0, color: '#ccc' };
		const len = pw.length;
		if (len >= 8) score += 1;
		if (len >= 12) score += 1;
		if (/[a-z]/.test(pw)) score += 1;
		if (/[A-Z]/.test(pw)) score += 1;
		if (/[0-9]/.test(pw)) score += 1;
		if (/[^A-Za-z0-9]/.test(pw)) score += 1;

		// normalize to 0-100
		const pct = Math.min(100, Math.round((score / 6) * 100));
		let color = '#ff4d4f';
		if (pct > 80) color = '#28a745';
		else if (pct > 60) color = '#ffc107';
		else if (pct > 40) color = '#ff7a00';

		return { score: pct, color };
	}

	function updateStrengthBar(pw) {
		const s = calculateStrength(pw);
		strengthBar.style.width = s.score + '%';
		strengthBar.style.background = s.color;
	}

	generateBtn.addEventListener('click', () => {
		const length = parseInt(lengthNumber.value, 10) || 16;
		const opts = {
			lower: lowerChk.checked,
			upper: upperChk.checked,
			numbers: numbersChk.checked,
			symbols: symbolsChk.checked,
		};
		if (!opts.lower && !opts.upper && !opts.numbers && !opts.symbols) {
			alert('Select at least one character type');
			return;
		}
		const pw = generatePassword(length, opts);
		passwordInput.value = pw;
		updateStrengthBar(pw);
	});

	copyBtn.addEventListener('click', async () => {
		const pw = passwordInput.value;
		if (!pw) return;
		try {
			await navigator.clipboard.writeText(pw);
			copyBtn.textContent = 'Copied!';
			setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
		} catch (e) {
			// fallback
			passwordInput.select();
			document.execCommand('copy');
			copyBtn.textContent = 'Copied!';
			setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
		}
	});

	// initialize
	updateStrengthBar('');
});
