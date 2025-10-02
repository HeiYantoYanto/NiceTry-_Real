// Modal logic
document.addEventListener('DOMContentLoaded', function() {
	const modal = document.getElementById('quiz-modal');
	const modalContent = document.getElementById('quiz-modal-content');
	window.showQuizModal = function(message, color) {
		modalContent.textContent = message;
		modalContent.style.color = color;
		modal.style.display = 'flex';
		setTimeout(() => {
			modal.style.display = 'none';
		}, 1000);
	};
});
// Simple quiz logic
document.addEventListener('DOMContentLoaded', function() {
	const question = document.getElementById('quiz-question');
	const trueBtn = document.getElementById('true-btn');
	const falseBtn = document.getElementById('false-btn');
	// Example question and answer
	const quiz = [
		{ q: 'Is Quick Sort a sorting algorithm?', a: true },
		{ q: 'Is Bubble Sort a searching algorithm?', a: false },
		{ q: 'Does Merge Sort use recursion?', a: true },
		{ q: 'Is Linear Search faster than Binary Search for sorted data?', a: false }
	];
	let current = 0;
	function showQuestion() {
		question.textContent = quiz[current].q;
	}
	trueBtn.onclick = () => {
		if (quiz[current].a) {
			window.showQuizModal('Correct!', 'green');
		} else {
			window.showQuizModal('Incorrect.', 'red');
		}
		setTimeout(nextQuestion, 1000);
	};
	falseBtn.onclick = () => {
		if (!quiz[current].a) {
			window.showQuizModal('Correct!', 'green');
		} else {
			window.showQuizModal('Incorrect.', 'red');
		}
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
		}
	}
	showQuestion();
});
