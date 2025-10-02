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
			q: 'Which data structure operates on the Last-In-First-Out (LIFO) principle?',
			choices: ['Queue', 'Stack', 'Linked List', 'Tree'],
			answer: 1
		},
		{
			q: 'What is the time complexity of accessing an element by index in an array?',
			choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
			answer: 0
		},
		{
			q: 'Which data structure is typically used to implement a priority queue?',
			choices: ['Array', 'Linked List', 'Heap', 'Stack'],
			answer: 2
		},
		{
			q: ' In a binary search tree (BST), what is the worst-case time complexity for searching?',
			choices: ['O(n log n)', 'O(log n)', 'O(1)', 'O(n)'],
			answer: 3
		},
		{
			q: 'Which data structure uses hashing to store and retrieve data?',
			choices: ['Stack', 'Queue', 'Hash Table', 'Linked List'],
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
