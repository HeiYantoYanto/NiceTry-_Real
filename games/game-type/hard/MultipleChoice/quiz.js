// Modal logic
document.addEventListener('DOMContentLoaded', function() {
	const modal = document.getElementById('quiz-modal');
	const modalContent = document.getElementById('quiz-modal-content');
	window.showQuizModal = function(message, color, callback) {
		modalContent.textContent = message;
		modalContent.style.color = color;
		modal.style.display = 'flex';
		setTimeout(() => {
			modal.style.display = 'none';
			if (typeof callback === 'function') callback();
		}, 1000);
	};
});
// Multiple choice quiz logic
document.addEventListener('DOMContentLoaded', function() {
	const question = document.getElementById('quiz-question');
	const choiceBtns = [
		document.getElementById('choice-btn-0'),
		document.getElementById('choice-btn-1'),
		document.getElementById('choice-btn-2'),
		document.getElementById('choice-btn-3')
	];
	// Example questions and answers
	const quiz = [
		{
			q: 'Which algorithm is used for sorting?',
			choices: ['Binary Search', 'Quick Sort', 'Linear Search', 'Depth First Search'],
			answer: 1
		},
		{
			q: 'Which data structure uses FIFO order?',
			choices: ['Stack', 'Queue', 'Tree', 'Graph'],
			answer: 1
		},
		{
			q: 'Which is NOT a searching algorithm?',
			choices: ['Bubble Sort', 'Binary Search', 'Linear Search', 'Jump Search'],
			answer: 0
		},
		{
			q: 'Which algorithm is recursive?',
			choices: ['Selection Sort', 'Quick Sort', 'Counting Sort', 'Insertion Sort'],
			answer: 1
		}
	];
	let current = 0;
	function showQuestion() {
		question.textContent = quiz[current].q;
		quiz[current].choices.forEach((choice, i) => {
			choiceBtns[i].textContent = choice;
			choiceBtns[i].style.display = '';
		});
	}
	choiceBtns.forEach((btn, i) => {
		btn.onclick = () => {
			if (i === quiz[current].answer) {
				window.showQuizModal('Correct!', 'green', nextQuestion);
			} else {
				window.showQuizModal('Incorrect.', 'red', nextQuestion);
			}
		};
	});
	function nextQuestion() {
		current++;
		if (current < quiz.length) {
			showQuestion();
		} else {
			question.textContent = 'Quiz Complete!';
			choiceBtns.forEach(btn => btn.style.display = 'none');
		}
	}
	showQuestion();
});
