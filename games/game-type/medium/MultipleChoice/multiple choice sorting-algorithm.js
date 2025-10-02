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
			q: 'Which sorting algorithm is best for linked lists?',
			choices: ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Selection Sort'],
			answer: 2
		},
		{
			q: 'Which sort has the least number of swaps in general?',
			choices: ['Insertion Sort', 'Selection Sort', 'Bubble Sort', 'Heap Sort'],
			answer: 1
		},
		{
			q: 'Which is NOT a stable algorithm?',
			choices: ['Merge Sort', 'Bucket Sort', 'Insertion Sort', 'Quick Sort'],
			answer: 3
		},
		{
			q: 'Heap Sort is preferred when:',
			choices: ['Memory is limited', 'Data already sorted', 'Stability is required', 'None of the above'],
			answer: 0
		},
		{
			q: 'Which sorting is used in external sorting?',
			choices: ['Bubble Sort', 'Merge Sort', 'Selection Sort', 'Heap Sort'],
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
