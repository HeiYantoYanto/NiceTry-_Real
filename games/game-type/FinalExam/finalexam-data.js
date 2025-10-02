// --- Modal logic (template-compatible) ---
const modal = document.getElementById('quiz-modal');
const modalContent = document.getElementById('quiz-modal-content');
function showQuizModal(message, color, duration = 1000, isFeedback = false) {
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
}

// --- Score tracker ---
const scoreCorrect = document.getElementById('score-correct');
const scoreWrong = document.getElementById('score-wrong');
let totalCorrect = 0;
let totalWrong = 0;
function updateScore() {
    if (scoreCorrect) scoreCorrect.textContent = `Correct: ${totalCorrect}`;
    if (scoreWrong) scoreWrong.textContent = `Wrong: ${totalWrong}`;
}

// --- True/False Quiz ---
const tofSection = document.getElementById('tof-section');
const tofQuestion = document.getElementById('tof-question');
const tofTrueBtn = document.getElementById('tof-true-btn');
const tofFalseBtn = document.getElementById('tof-false-btn');
const tofQuiz = [
    { q: 'A linked list provides constant time O(1) for accessing an element at a random index.', a: false },
    { q: 'A balanced Binary Search Tree (BST) allows for search, insertion, and deletion in O(log n) time.', a: true },
    { q: 'Selection Sort is an unstable sorting algorithm.', a: true },
    { q: 'The worst-case time complexity for Linear Search is O(log n).', a: false },
    { q: 'A graph can have cycles, but a tree cannot.', a: true },
    { q: 'Heap Sort has a worst-case time complexity of O(n log n).', a: true },
    { q: 'A stack can be implemented using two queues.', a: true },
    { q: 'Quick Sort is always faster than Merge Sort.', a: false },
    { q: 'In a doubly linked list, each node contains a pointer to both its next and previous nodes.', a: true },
    { q: 'The Breadth-First Search (BFS) algorithm uses a stack data structure.', a: false }
];
let tofCurrent = 0;
function showTofQuestion() {
    tofQuestion.textContent = tofQuiz[tofCurrent].q;
}
function nextTofQuestion() {
    tofCurrent++;
    if (tofCurrent < tofQuiz.length) {
        showTofQuestion();
    } else {
        tofSection.style.display = 'none';
        startMcq();
    }
}
tofTrueBtn.onclick = () => {
    const correct = !!tofQuiz[tofCurrent].a;
    if (correct) totalCorrect++; else totalWrong++;
    updateScore();
    showQuizModal(correct ? 'Correct!' : 'Incorrect.', correct ? 'limegreen' : 'crimson', 1000, true);
    setTimeout(nextTofQuestion, 1000);
};
tofFalseBtn.onclick = () => {
    const correct = !tofQuiz[tofCurrent].a;
    if (correct) totalCorrect++; else totalWrong++;
    updateScore();
    showQuizModal(correct ? 'Correct!' : 'Incorrect.', correct ? 'limegreen' : 'crimson', 1000, true);
    setTimeout(nextTofQuestion, 1000);
};
showTofQuestion();
updateScore();

// --- MCQ Quiz ---
const mcqSection = document.getElementById('mcq-section');
const mcqQuestion = document.getElementById('mcq-question');
const mcqBtns = [
    document.getElementById('mcq-btn-0'),
    document.getElementById('mcq-btn-1'),
    document.getElementById('mcq-btn-2'),
    document.getElementById('mcq-btn-3')
];
const mcqQuiz = [
    {
        q: 'Which data structure follows the Last-In-First-Out (LIFO) principle?',
        choices: ['Queue', 'Linked List', 'Stack', 'Tree'],
        answer: 2,
    },
    {
        q: 'What is the time complexity of accessing an element by index in an array?',
        choices: ['O(n)', 'O(n log n)', 'O(1)', 'O(log n)'],
        answer: 2
    },
    {
        q: 'In the context of a Binary Search Tree (BST), what is an "in-order" traversal?',
        choices: ['Root -> Left -> Right', 'Left -> Root -> Right', 'Left -> Right -> Root', 'Right -> Root -> Left'],
        answer: 1
    },
    {
        q: 'Which sorting algorithm has a worst-case time complexity of O(n²) but often performs well on small or nearly sorted lists?',
        choices: ['Merge Sort', 'Heap Sort', 'Insertion Sort', 'Quick Sort'],
        answer: 2
    },
    {
        q: 'The "Bubble Sort" algorithm primarily...',
        choices: ['...builds a sorted list by inserting one element at a time.', '...repeatedly compares and swaps adjacent elements if they are in the wrong order.', '...divides the list into halves, sorts them, and then merges them.', '...selects the smallest element and swaps it with the first unsorted element.'],
        answer: 1
    },
    {
        q: 'Which search algorithm requires the data to be pre-sorted?',
        choices: ['Linear Search', 'Breadth-First Search (BFS)', 'Binary Search', 'Depth-First Search (DFS)'],
        answer: 2
    },
    {
        q: 'What is the main advantage of a Linked List over an Array?',
        choices: ['Faster access time by index.', 'More efficient memory usage.', 'Dynamic size and ease of insertion/deletion.', 'Built-in sorting algorithms.'],
        answer: 2
    },
    {
        q: 'Which data structure is typically used to implement a First-In-First-Out (FIFO) system, like a print queue?',
        choices: ['Stack', 'Tree', 'Graph', 'Queue'],
        answer: 3
    },
    {
        q: 'What is the worst-case time complexity of the Quick Sort algorithm?',
        choices: ['O(n²)', 'O(log n)', 'O(n log n)', 'O(n)'],
        answer: 0
    },
    {
        q: 'In a Max-Heap, the value of any given node is...',
        choices: ['...less than or equal to the values of its children.', ' ...greater than or equal to the values of its children.', '...unrelated to the values of its children.', '...always a prime number.'],
        answer: 1
    },
    {
        q: 'Which graph traversal algorithm uses a queue to visit all neighbors at the present depth before moving to nodes at the next depth level?',
        choices: ['Depth-First Search', 'Breadth-First Search (BFS)', 'Binary Search', ' In-order Search'],
        answer: 1
    },
    {
        q: 'The process of maintaining the properties of a Heap after insertion or deletion is called:',
        choices: ['Sorting', 'Heapifying', 'Traversing', 'Hashing'],
        answer: 1
    },
    {
        q: 'Which algorithm is NOT a comparison-based sort?',
        choices: ['Merge Sort', 'Quick Sort', 'Radix Sort', 'Bubble Sort'],
        answer: 2
    },
    {
        q: 'What is the space complexity of Merge Sort?',
        choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        answer: 1
    },
    {
        q: 'A data structure that maps keys to values for highly efficient lookup is called a:',
        choices: ['Stack', 'Hash Table', 'Linked List', 'Array'],
        answer: 1
    },
    {
        q: 'Which operation is NOT typically O(1) for a Hash Table (on average)?',
        choices: ['Insertion', 'Deletion', 'Search', 'Finding the minimum element'],
        answer: 3
    },
    {
        q: 'The "Divide and Conquer" strategy is used by which pair of algorithms?',
        choices: ['Insertion Sort and Linear Search', 'Bubble Sort and Selection Sort', 'Merge Sort and Quick Sort', 'Heap Sort and Radix Sort'],
        answer: 2
    },
    {
        q: 'In a directed graph, if node A points to node B, then node B is A',
        choices: ['Parent', 'Sibling', 'Adjacent Node', 'Predecessor'],
        answer: 2
    },
    {
        q: 'Which data structure is best for implementing a backtracking algorithm, like solving a maze?',
        choices: ['Queue', 'Stack', 'Heap', 'Array'],
        answer: 1
    },
    {
        q: 'What is the time complexity of performing a binary search on a sorted array of n elements?',
        choices: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
        answer: 3
    },
];
let mcqCurrent = 0;
function showMcqQuestion() {
    mcqQuestion.textContent = mcqQuiz[mcqCurrent].q;
    mcqQuiz[mcqCurrent].choices.forEach((choice, i) => {
        mcqBtns[i].textContent = choice;
        mcqBtns[i].style.display = '';
    });
}
function nextMcqQuestion() {
    mcqCurrent++;
    if (mcqCurrent < mcqQuiz.length) {
        showMcqQuestion();
    } else {
        mcqSection.style.display = 'none';
        startFitb();
    }
}
function startMcq() {
    mcqSection.style.display = 'block';
    showMcqQuestion();
}
mcqBtns.forEach((btn, i) => {
    btn.onclick = () => {
        const correct = i === mcqQuiz[mcqCurrent].answer;
        if (correct) totalCorrect++; else totalWrong++;
        updateScore();
        showQuizModal(correct ? 'Correct!' : 'Incorrect.', correct ? 'limegreen' : 'crimson', 1000, true);
        setTimeout(nextMcqQuestion, 1000);
    };
});

// --- Fill in the Blanks Quiz ---
const fitbSection = document.getElementById('fitb-section');
const fitbQuestion = document.getElementById('fitb-question');
const fitbInput = document.getElementById('fitb-input');
const fitbNextBtn = document.getElementById('fitb-next-btn');
const fitbQuiz = [
    { text: "The process of rearranging items in a list into a specific order (e.g., numerical or alphabetical) is called _______.", answer: "SORTING" },
    { text: "In a Binary Search Tree, for any node, all values in its left subtree are _______ than the node's value.", answer: "LESS OR SMALLER" },
    { text: "A _______ is a data structure where each element is connected to one or more other elements, without the hierarchical structure of a tree.", answer: "GRAPH" },
    { text: "The _______ sorting algorithm works by repeatedly finding the minimum element from the unsorted part and putting it at the beginning.", answer: "SELECTION SORT" },
    { text: "The average-case time complexity of search, insert, and delete operations in a hash table is _______.", answer: "O(1) OR CONSTANT TIME)" },
];
let fitbCurrent = 0;
function showFitbQuestion() {
    fitbQuestion.textContent = fitbQuiz[fitbCurrent].text;
    fitbInput.value = '';
    fitbInput.focus();
}
function checkFitbAnswer() {
    const userAnswer = fitbInput.value.trim().toLowerCase();
    const correctAnswer = fitbQuiz[fitbCurrent].answer.trim().toLowerCase();
    return userAnswer === correctAnswer;
}
function nextFitbQuestion() {
    if (fitbCurrent < fitbQuiz.length - 1) {
        fitbCurrent++;
        showFitbQuestion();
    } else {
        fitbSection.style.display = "none";
        let totalQuestions = tofQuiz.length + mcqQuiz.length + fitbQuiz.length;
        let pass = totalCorrect >= Math.ceil(totalQuestions * 0.6);
        let resultMsg = `<div style="border: 4px solid ${pass ? 'limegreen' : 'crimson'}; background: #181818ee; border-radius: 1.2rem; padding: 36px 48px; min-width: 260px; box-shadow: 0 0.5rem 2rem #131313; text-align: center;">
                <div style='color:${pass ? 'limegreen' : 'crimson'};font-size:2rem;margin-bottom:10px;'>${pass ? 'You Passed!' : 'You Failed!'}</div>
                <div style='font-size:1.3rem;margin-bottom:10px;'>Correct: <b>${totalCorrect}</b> | Wrong: <b>${totalWrong}</b></div>
                <button id='back-btn' style='margin:8px 16px 0 0;padding:10px 24px;font-size:1rem;border-radius:8px;border:none;background:#333;color:#fff;cursor:pointer;'>Back</button>
                <button id='try-again-btn' style='margin:8px 0 0 0;padding:10px 24px;font-size:1rem;border-radius:8px;border:none;background:#4caf50;color:#fff;cursor:pointer;'>Try Again</button>
            </div>`;
        showQuizModal(resultMsg, '#fff', 0);
        setTimeout(() => {
            const backBtn = document.getElementById('back-btn');
            const tryAgainBtn = document.getElementById('try-again-btn');
            if (backBtn) backBtn.onclick = () => { window.location.href = '../../gamesnew.html'; };
            if (tryAgainBtn) tryAgainBtn.onclick = () => { window.location.reload(); };
        }, 100);
    }
}
function startFitb() {
    fitbSection.style.display = "block";
    fitbCurrent = 0;
    showFitbQuestion();
}
function showFitbFeedback(isCorrect) {
    showQuizModal(isCorrect ? 'Correct!' : 'Incorrect.', isCorrect ? 'limegreen' : 'crimson', 1000, true);
}
fitbNextBtn.onclick = () => {
    const isCorrect = checkFitbAnswer();
    if (isCorrect) totalCorrect++; else totalWrong++;
    updateScore();
    showFitbFeedback(isCorrect);
    fitbNextBtn.disabled = true;
    fitbInput.disabled = true;
    setTimeout(() => {
        fitbNextBtn.disabled = false;
        fitbInput.disabled = false;
        nextFitbQuestion();
    }, 1100);
};
fitbInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        fitbNextBtn.click();
    }
});