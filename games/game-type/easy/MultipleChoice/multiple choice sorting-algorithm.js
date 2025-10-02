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
			q: 'Which sorting algorithm has the worst-case time complexity of O(n log n) and is stable?',
			choices: ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Selection Sort'],
			answer: 2
		},
		{
			q: 'Which sorting algorithm works by repeatedly selecting the smallest element from the unsorted portion and swapping it with the first unsorted element?',
			choices: ['Insertion Sort', 'Selection Sort', 'Bubble Sort', 'Heap Sort'],
			answer: 1
		},
		{
			q: 'Which sorting algorithm is based on the divide-and-conquer strategy and uses a pivot element to partition the array?',
			choices: ['Merge Sort', 'Bucket Sort', 'Radix Sort', 'Quick Sort'],
			answer: 3
		},
		{
			q: 'hich non-comparison-based sorting algorithm is efficient for integers when the range of values is known and relatively small?',
			choices: ['Counting Sort', 'Quick Sort', 'Shell Sort', 'Insertion Sort'],
			answer: 0
		},
		{
			q: 'Which sorting algorithm is known for its ability to sort data in linear time O(n) when the input is uniformly distributed?',
			choices: ['Bubble Sort', 'Bucket Sort', 'Selection Sort', 'Heap Sort'],
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
