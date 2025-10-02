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
			q: 'Which is best for dynamic memory and frequent insertions?',
			choices: ['Queue', 'Stack', 'Linked List', 'Tree'],
			answer: 2
		},
		{
			q: 'What is the time complexity of searching in a balanced binary search tree (BST)?',
			choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
			answer: 2
		},
		{
			q: 'Which is best for implementing recursion?',
			choices: ['Array', 'Linked List', 'Heap', 'Stack'],
			answer: 3
		},
		{
			q: 'Which representation of a graph is most space-efficient for sparse graphs?',
			choices: ['Adjacency Matrix', 'Adjacency List', 'Both', 'None'],
			answer: 1
		},
		{
			q: 'What is the parent of the root node in a tree?',
			choices: ['Null', 'Leaf', 'Edge', 'None of the above'],
			answer: 0
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
