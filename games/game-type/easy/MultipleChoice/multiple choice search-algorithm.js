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
			q: 'Which search algorithm requires the data to be sorted beforehand?',
			choices: ['Linear Search', 'Binary Search', 'Jump Search', 'Both b and c'],
			answer: 3
		},
		{
			q: 'What is the worst-case time complexity of Linear Search?',
			choices: ['O(1)', 'O(log n)', ' O(n)', 'O(n log n)'],
			answer: 2
		},
		{
			q: 'Which search algorithm uses a formula to estimate the position of the target value in a sorted array?',
			choices: ['Binary Search', 'Interpolation Search', 'Ternary Search', 'Exponential Search'],
			answer: 1
		},
		{
			q: 'Which search algorithm is most efficient for large sorted arrays with uniformly distributed values?',
			choices: ['Linear Search', 'Binary Search', 'Interpolation Search', 'Jump Search'],
			answer: 2
		},
		{
			q: 'What is the time complexity of Binary Search in the worst case?',
			choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
			answer: 2
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
				window.showQuizModal('Correct!', 'green');
			} else {
				window.showQuizModal('Incorrect.', 'red');
			}
			setTimeout(nextQuestion, 1000);
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
