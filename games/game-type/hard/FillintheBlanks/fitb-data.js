// FITB game using ToF layout/modal/score tracker
document.addEventListener('DOMContentLoaded', function() {
    // Modal helper (mirror ToF)
    const modal = document.getElementById('quiz-modal');
    const modalContent = document.getElementById('quiz-modal-content');
    window.showQuizModal = function(message, color, duration = 1000, isFeedback = false) {
        if (!modal || !modalContent) return; // defensive
        if (isFeedback) {
            modalContent.innerHTML = `<div style="border: 3px solid ${color}; background: #181818ee; border-radius: 1.2rem; padding: 32px 48px; min-width: 220px; font-size: 2rem; font-weight: bold; box-shadow: 0 0.5rem 2rem #131313; color: ${color}; text-align: center;">${message}</div>`;
        } else {
            modalContent.innerHTML = message;
            modalContent.style.color = color || '#fff';
        }
        modal.style.display = 'flex';
        if (duration > 0) {
            setTimeout(() => {
                modal.style.display = 'none';
            }, duration);
        }
    };

    // Data
    const questions = [
        { text: "A Red-Black Tree is a type of ________ search tree.", answer: "BALANCED" },
        { text: "A B-tree of order m can have at most ________ children per node.", answer: "m" },
        { text: "Dijkstra’s algorithm uses a priority ________.", answer: "QUEUE" },
        { text: "In a trie, each node typically represents a ________.", answer: "CHARACTER" },
        { text: "A disjoint set is often implemented using ________ with path compression.", answer: "UNION FIND" },
    ];

    // Elements from ToF-styled page
    const questionEl = document.getElementById('quiz-question');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const scoreCorrect = document.getElementById('score-correct');
    const scoreWrong = document.getElementById('score-wrong');

    // State
    let current = 0;
    let correct = 0;
    let wrong = 0;
    const correctList = []; // keep text of correctly answered questions

    function updateScore() {
        scoreCorrect.textContent = `Correct: ${correct}`;
        scoreWrong.textContent = `Wrong: ${wrong}`;
    }

    function showQuestion() {
        questionEl.textContent = questions[current].text;
        answerInput.value = '';
        answerInput.focus();
    }

    function checkAnswer() {
        const userAnswer = (answerInput.value || '').trim().toLowerCase();
        const correctAnswer = questions[current].answer.trim().toLowerCase();
        return userAnswer === correctAnswer;
    }

    function nextQuestion() {
        current++;
        if (current < questions.length) {
            showQuestion();
        } else {
            // End of quiz: show modal with score and list of correctly answered questions
            const pass = correct >= Math.ceil(questions.length * 0.6);
            const listHtml = correctList.length
                ? `<ul style='text-align:left;max-height:40vh;overflow:auto;margin:10px 0 0 0;padding:0 0 0 20px;'>${correctList.map(q => `<li style="margin:6px 0;">${q}</li>`).join('')}</ul>`
                : `<div style='opacity:0.8;'>No questions answered correctly yet.</div>`;
            const resultMsg = `<div style="border: 4px solid ${pass ? 'limegreen' : 'crimson'}; background: #181818ee; border-radius: 1.2rem; padding: 24px 32px; min-width: 280px; box-shadow: 0 0.5rem 2rem #131313; text-align: center; color:#fff;">
                    <div style='color:${pass ? 'limegreen' : 'crimson'};font-size:2rem;margin-bottom:10px;'>${pass ? 'You Passed!' : 'You Failed!'}</div>
                    <div style='font-size:1.2rem;margin-bottom:10px;'>Correct: <b>${correct}</b> | Wrong: <b>${wrong}</b></div>
                    <div style='font-size:1.1rem;margin:10px 0;'>Questions you got right:</div>
                    ${listHtml}
                    <div style='margin-top:16px;'>
                        <button id='back-btn' style='margin:8px 8px 0 0;padding:10px 18px;font-size:1rem;border-radius:8px;border:none;background:#333;color:#fff;cursor:pointer;'>Back</button>
                        <button id='try-again-btn' style='margin:8px 0 0 0;padding:10px 18px;font-size:1rem;border-radius:8px;border:none;background:#4caf50;color:#fff;cursor:pointer;'>Try Again</button>
                    </div>
            </div>`;
            if (window.showQuizModal) {
                window.showQuizModal(resultMsg, '#fff', 0);
            } else {
                alert(`Score: ${correct}/${questions.length}`);
            }
            setTimeout(() => {
                const backBtn = document.getElementById('back-btn');
                const tryAgainBtn = document.getElementById('try-again-btn');
                if (backBtn) backBtn.onclick = () => { window.location.href = '../../../gamesnew-easy.html'; };
                if (tryAgainBtn) tryAgainBtn.onclick = () => { window.location.reload(); };
            }, 100);
        }
    }

    function handleSubmit() {
        const isCorrect = checkAnswer();
        if (window.showQuizModal) {
            window.showQuizModal(isCorrect ? 'Correct!' : 'Incorrect.', isCorrect ? 'green' : 'red', 900, true);
        }
        if (isCorrect) {
            correct++;
            correctList.push(questions[current].text);
        } else {
            wrong++;
        }
        updateScore();
        submitBtn.disabled = true;
        answerInput.disabled = true;
        setTimeout(() => {
            submitBtn.disabled = false;
            answerInput.disabled = false;
            nextQuestion();
        }, 950);
    }

    submitBtn.addEventListener('click', handleSubmit);
    answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSubmit();
    });

        // Modal fallback not needed as we define it above

    // Initialize
    updateScore();
    showQuestion();

    // Check for achievement: all questions correct
    if (correct === questions.length) {
        showQuizModal('Achievement Unlocked: Perfect Score!', 'gold', 3000, true);
    }
});
