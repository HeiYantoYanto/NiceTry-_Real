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
			q: 'Which traversal visits nodes in the order: root, left, right?',
			choices: ['Preorder', 'Inorder', 'Postorder', 'BFS'],
			answer: 0
		},
		{
			q: 'The time complexity of DFS in a graph is:',
			choices: ['O(V+E)', 'O(log n)', ' O(VE)', 'O(n log n)'],
			answer: 0
		},
		{
			q: 'Which searching algorithm works best when data is uniformly distributed?',
			choices: ['Binary Search', 'Interpolation Search', 'Ternary Search', 'Exponential Search'],
			answer: 1
		},
		{
			q: 'Which search is guaranteed O(1) in ideal cases?',
			choices: ['Linear', 'Hashing', 'Jump', 'Binary'],
			answer: 1
		},
		{
			q: 'BFS is commonly used for:',
			choices: ['Shortest path', 'Minimmum Spanning Tree', 'Sorting', 'Hashing'],
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
