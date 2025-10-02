// Modal logic
document.addEventListener('DOMContentLoaded', function() {
	const modal = document.getElementById('quiz-modal');
	const modalContent = document.getElementById('quiz-modal-content');
	window.showQuizModal = function(message, color, duration = 1000, isFeedback = false) {
		// If isFeedback, wrap message in a box
		if (isFeedback) {
			modalContent.innerHTML = `<div style="border: 3px solid ${color}; background: #181818ee; border-radius: 1.2rem; padding: 32px 48px; min-width: 220px; font-size: 2rem; font-weight: bold; box-shadow: 0 0.5rem 2rem #131313; color: ${color}; text-align: center;">${message}</div>`;
		} else {
			modalContent.innerHTML = message;
			modalContent.style.color = color;
		}
		modal.style.display = 'flex';
		if (duration > 0) {
			setTimeout(() => {
				modal.style.display = 'none';
			}, duration);
		}
	};
});
// Simple quiz logic
document.addEventListener('DOMContentLoaded', function() {
	const question = document.getElementById('quiz-question');
	const trueBtn = document.getElementById('true-btn');
	const falseBtn = document.getElementById('false-btn');
	const scoreCorrect = document.getElementById('score-correct');
	const scoreWrong = document.getElementById('score-wrong');

	const quiz = [
		{ q: 'A stack follows the First-In-First-Out (FIFO) principle.', a: false },
		{ q: 'In a doubly linked list, each node has pointers to both the next and previous nodes.', a: true },
		{ q: 'A binary tree can have more than two children per node.', a: false },
		{ q: 'A graph can contain cycles.', a: true },
		{ q: 'A hash table always provides O(1) time complexity for insertions and lookups.', a: false },
		{ q: 'A queue operates based on the Last-In-First-Out (LIFO) principle.', a: false },
		{ q: 'A heap is always a complete binary tree.', a: true },
		{ q: 'An array allows constant-time access to any element.', a: true },
		{ q: 'A linked list requires contiguous memory allocation.', a: false },
		{ q: 'A tree is a linear data structure.', a: false }
	];
	let current = 0;
	let correct = 0;
	let wrong = 0;

	function updateScore() {
		scoreCorrect.textContent = `Correct: ${correct}`;
		scoreWrong.textContent = `Wrong: ${wrong}`;
	}

	function showQuestion() {
		question.textContent = quiz[current].q;
	}
	trueBtn.onclick = () => {
		if (quiz[current].a) {
			window.showQuizModal('Correct!', 'green', 1000, true);
			correct++;
		} else {
			window.showQuizModal('Incorrect.', 'red', 1000, true);
			wrong++;
		}
		updateScore();
		setTimeout(nextQuestion, 1000);
	};
	falseBtn.onclick = () => {
		if (!quiz[current].a) {
			window.showQuizModal('Correct!', 'green', 1000, true);
			correct++;
		} else {
			window.showQuizModal('Incorrect.', 'red', 1000, true);
			wrong++;
		}
		updateScore();
		setTimeout(nextQuestion, 1000);
	};
	function nextQuestion() {
		current++;
		if (current < quiz.length) {
			showQuestion();
		} else {
			question.textContent = 'Quiz Complete!';
			trueBtn.style.display = 'none';
			falseBtn.style.display = 'none';
			// Show final modal with score and options
			let pass = correct >= Math.ceil(quiz.length * 0.6); // 60% to pass
			let resultMsg = `<div style="border: 4px solid ${pass ? 'limegreen' : 'crimson'}; background: #181818ee; border-radius: 1.2rem; padding: 36px 48px; min-width: 260px; box-shadow: 0 0.5rem 2rem #131313; text-align: center;">
				<div style='color:${pass ? 'limegreen' : 'crimson'};font-size:2rem;margin-bottom:10px;'>${pass ? 'You Passed!' : 'You Failed!'}</div>
				<div style='font-size:1.3rem;margin-bottom:10px;'>Correct: <b>${correct}</b> | Wrong: <b>${wrong}</b></div>
				<button id='back-btn' style='margin:8px 16px 0 0;padding:10px 24px;font-size:1rem;border-radius:8px;border:none;background:#333;color:#fff;cursor:pointer;'>Back</button>
				<button id='try-again-btn' style='margin:8px 0 0 0;padding:10px 24px;font-size:1rem;border-radius:8px;border:none;background:#4caf50;color:#fff;cursor:pointer;'>Try Again</button>
			</div>`;
			window.showQuizModal(resultMsg, '#fff', 0);
			// Add event listeners for buttons
			setTimeout(() => {
				const backBtn = document.getElementById('back-btn');
				const tryAgainBtn = document.getElementById('try-again-btn');
				if (backBtn) {
					backBtn.onclick = () => {
						window.location.href = '../../../gamesnew-easy.html';
					};
				}
				if (tryAgainBtn) {
					tryAgainBtn.onclick = () => {
						window.location.reload();
					};
				}
			}, 100);
		}
	}
	showQuestion();
	updateScore();
});
