document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('gfg_token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    const sectionsContainer = document.getElementById('practice-sections');
    const arenaModal = document.getElementById('arena-modal');
    const leaveArenaBtn = document.getElementById('leave-arena');
    const runBtn = document.getElementById('run-code');
    const submitBtn = document.getElementById('submit-code');
    const statusText = document.getElementById('run-status');
    const editor = document.getElementById('code-editor');
    const langSelect = document.getElementById('code-lang');
    
    // Result Modal Elements
    const resultModal = document.getElementById('result-modal');
    const resultClose = document.getElementById('result-close');

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('gfg_token');
            localStorage.removeItem('gfg_user');
            window.location.href = 'index.html';
        });
    }

    let currentProblemId = null;

    // Fetch Problems
    try {
        const response = await fetch('/api/practice');
        const problems = await response.json();
        
        if (problems.length > 0) {
            sectionsContainer.innerHTML = '';
            
            // Group by category
            const categories = {};
            problems.forEach(p => {
                if (!categories[p.category]) categories[p.category] = [];
                categories[p.category].push(p);
            });

            for (const cat in categories) {
                const section = document.createElement('div');
                section.className = 'category-container';
                
                let tableHtml = `
                    <div class="category-header">
                        <h2>${cat}</h2>
                    </div>
                    <table class="problem-table">
                        <thead>
                            <tr>
                                <th>Problem Name</th>
                                <th>Difficulty</th>
                                <th>Submissions</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                categories[cat].forEach(p => {
                    const diffClass = `diff-${p.difficulty.toLowerCase()}`;
                    tableHtml += `
                        <tr class="problem-row">
                            <td>
                                <div class="problem-title-cell">
                                    <i class='bx bx-file-blank' style="color: var(--primary)"></i>
                                    ${p.title}
                                </div>
                            </td>
                            <td><span class="diff-badge ${diffClass}">${p.difficulty}</span></td>
                            <td>${p.solved_count} Solved</td>
                            <td><button class="solve-btn" onclick="openPracticeArena(${p.id})">Solve Now</button></td>
                        </tr>
                    `;
                });

                tableHtml += `</tbody></table>`;
                section.innerHTML = tableHtml;
                sectionsContainer.appendChild(section);
            }
        }
    } catch (error) {
        console.error('Error loading problems:', error);
        sectionsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Failed to load problems.</p>';
    }

    // Open Arena
    window.openPracticeArena = async (id) => {
        currentProblemId = id;
        try {
            const response = await fetch(`/api/practice/${id}`);
            const p = await response.json();

            document.getElementById('arena-title').textContent = p.title;
            document.getElementById('prob-title').textContent = p.title;
            document.getElementById('prob-desc').textContent = p.description;
            document.getElementById('prob-input').textContent = p.input_format;
            document.getElementById('prob-output').textContent = p.output_format;
            document.getElementById('prob-constraints').textContent = p.constraints;
            document.getElementById('prob-sample-in').textContent = p.sample_input;
            document.getElementById('prob-sample-out').textContent = p.sample_output;
            
            const diffElem = document.getElementById('arena-diff');
            diffElem.textContent = p.difficulty;
            diffElem.className = `diff-badge diff-${p.difficulty.toLowerCase()}`;

            arenaModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Set default template
            resetTemplate();

        } catch (error) {
            console.error('Error fetching problem details:', error);
        }
    };

    leaveArenaBtn.addEventListener('click', () => {
        arenaModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    const templates = {
        cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Code here\n    return 0;\n}",
        java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Code here\n    }\n}",
        python: "def solve():\n    # Code here\n    pass\n\nif __name__ == '__main__':\n    solve()"
    };

    function resetTemplate() {
        editor.value = templates[langSelect.value];
        statusText.textContent = "Ready";
    }

    langSelect.addEventListener('change', resetTemplate);
    document.getElementById('reset-code').addEventListener('click', resetTemplate);

    // Simulated Run/Submit
    runBtn.addEventListener('click', () => {
        statusText.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Running sample tests...";
        setTimeout(() => {
            statusText.innerHTML = "<span style='color: var(--primary)'><i class='bx bx-check'></i> All Sample Tests Passed</span>";
        }, 1200);
    });

    submitBtn.addEventListener('click', async () => {
        const btnOriginal = submitBtn.innerHTML;
        submitBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Submitting...";
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/contests/submit', { // Reuse contest submission API
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contest_id: 0, // 0 for general practice
                    problem_id: currentProblemId,
                    language: langSelect.value,
                    code: editor.value,
                    status: 'Accepted', // Simulated result
                    time: 25,
                    memory: 12.5
                })
            });

            if (response.ok) {
                setTimeout(() => {
                    submitBtn.innerHTML = btnOriginal;
                    submitBtn.disabled = false;
                    resultModal.classList.add('active');
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            submitBtn.innerHTML = btnOriginal;
            submitBtn.disabled = false;
            alert('Failed to submit.');
        }
    });

    resultClose.addEventListener('click', () => {
        resultModal.classList.remove('active');
        arenaModal.classList.remove('active');
        document.body.style.overflow = '';
        window.location.reload(); // Refresh to see updated solve counts
    });
});
