document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('gfg_token');
    
    // Redirect if not logged in
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    // DOM Elements
    const elements = {
        name: document.getElementById('user-name'),
        deptYear: document.getElementById('user-dept-year'),
        skills: document.getElementById('user-skills'),
        solved: document.getElementById('stat-solved'),
        rank: document.getElementById('stat-rank'),
        badges: document.getElementById('stat-badges'),
        gfg: document.getElementById('link-gfg'),
        lc: document.getElementById('link-lc'),
        gh: document.getElementById('link-gh'),
        eventsList: document.getElementById('events-list'),
        submissionsList: document.getElementById('submissions-list')
    };

    // Logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('gfg_token');
        localStorage.removeItem('gfg_user');
        window.location.href = 'index.html';
    });

    // Fetch Profile Data
    try {
        const response = await fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('gfg_token');
            window.location.href = 'auth.html';
            return;
        }

        const user = await response.json();

        // Populate DOM
        document.getElementById('welcome-text').textContent = `Welcome back, ${user.name.split(' ')[0]}`;
        elements.name.textContent = user.name;
        elements.deptYear.textContent = `${user.department} • ${user.year}`;
        elements.solved.textContent = user.problems_solved || 0;
        elements.rank.textContent = user.rank > 0 ? `#${user.rank}` : '--';
        elements.badges.textContent = Math.floor((user.problems_solved || 0) / 10); // Simple mock
        
        // Links
        if (user.gfg_link) elements.gfg.href = user.gfg_link;
        else elements.gfg.style.display = 'none';

        if (user.leetcode_link) elements.lc.href = user.leetcode_link;
        else elements.lc.style.display = 'none';

        if (user.github_link) elements.gh.href = user.github_link;
        else elements.gh.style.display = 'none';

        // Skills
        elements.skills.innerHTML = '';
        if (user.skills) {
            const skillArray = user.skills.split(',').map(s => s.trim()).filter(s => s);
            if (skillArray.length > 0) {
                skillArray.forEach(skill => {
                    const span = document.createElement('span');
                    span.className = 'skill-tag';
                    span.textContent = skill;
                    elements.skills.appendChild(span);
                });
            } else {
                elements.skills.innerHTML = '<span class="skill-tag" style="opacity: 0.5;">No skills added</span>';
            }
        } else {
            elements.skills.innerHTML = '<span class="skill-tag" style="opacity: 0.5;">No skills added</span>';
        }

        // Setup Edit Modal values
        document.getElementById('edit-skills').value = user.skills || '';
        document.getElementById('edit-gfg').value = user.gfg_link || '';
        document.getElementById('edit-lc').value = user.leetcode_link || '';
        document.getElementById('edit-gh').value = user.github_link || '';

    } catch (error) {
        console.error('Failed to load profile:', error);
    }

    // Fetch Recent Events
    try {
        const response = await fetch('/api/user/events', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const events = await response.json();
        
        if (events.length > 0) {
            elements.eventsList.innerHTML = '';
            const certSection = document.getElementById('cert-section');
            const certsList = document.getElementById('certs-list');
            certSection.style.display = 'block';
            certsList.innerHTML = '';

            events.forEach(event => {
                const date = new Date(event.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                
                // Event Item
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.innerHTML = `
                    <div class="activity-main">
                        <div class="activity-icon"><i class='bx bx-calendar-check'></i></div>
                        <div class="activity-text">
                            <h4>${event.event_name}</h4>
                            <p>Ticket ID: #${event.id.toString().padStart(4, '0')}</p>
                        </div>
                    </div>
                    <div class="activity-meta">
                        <span class="activity-status">Registered</span><br>
                        <span class="activity-date">${date}</span>
                    </div>
                `;
                elements.eventsList.appendChild(item);

                // Mock Certificate Item
                const cert = document.createElement('div');
                cert.className = 'activity-item';
                cert.innerHTML = `
                    <div class="activity-main">
                        <div class="activity-icon" style="color: #ffd700;"><i class='bx bxs-award'></i></div>
                        <div class="activity-text">
                            <h4>${event.event_name} - Certificate</h4>
                            <p>Issued on ${date}</p>
                        </div>
                    </div>
                    <div class="activity-meta">
                        <button class="btn btn-outline btn-sm" onclick="alert('Downloading Certificate...')">Download PDF</button>
                    </div>
                `;
                certsList.appendChild(cert);
            });
        }
    } catch (error) {
        console.error('Failed to load events:', error);
    }

    // Fetch Recent Submissions
    try {
        const response = await fetch('/api/user/submissions', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const submissions = await response.json();
        
        if (submissions.length > 0) {
            elements.submissionsList.innerHTML = '';
            submissions.forEach(sub => {
                const date = new Date(sub.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.innerHTML = `
                    <div class="activity-main">
                        <div class="activity-icon" style="color: ${sub.status === 'Accepted' ? 'var(--primary)' : '#ff5f56'}">
                            <i class='bx ${sub.status === 'Accepted' ? 'bx-check-circle' : 'bx-x-circle'}'></i>
                        </div>
                        <div class="activity-text">
                            <h4>${sub.contest_title || 'Practice Problem'} - ${sub.problem_id}</h4>
                            <p>${sub.language} • ${sub.status}</p>
                        </div>
                    </div>
                    <div class="activity-meta">
                        <span class="activity-status" style="background: ${sub.status === 'Accepted' ? 'rgba(47,141,70,0.1)' : 'rgba(255,95,86,0.1)'}; color: ${sub.status === 'Accepted' ? 'var(--primary)' : '#ff5f56'}">${sub.status}</span><br>
                        <span class="activity-date">${date}</span>
                    </div>
                `;
                elements.submissionsList.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Failed to load submissions:', error);
    }

    // Edit Profile Logic
    const editModal = document.getElementById('edit-modal');
    const editBtn = document.getElementById('edit-profile-btn');
    const editClose = document.getElementById('edit-modal-close');
    const editForm = document.getElementById('edit-profile-form');

    editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        editModal.classList.add('active');
    });

    editClose.addEventListener('click', () => editModal.classList.remove('active'));

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updates = {
            skills: document.getElementById('edit-skills').value,
            gfg_link: document.getElementById('edit-gfg').value,
            leetcode_link: document.getElementById('edit-lc').value,
            github_link: document.getElementById('edit-gh').value,
        };

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error(error);
            alert('Error connecting to server.');
        }
    });
});
