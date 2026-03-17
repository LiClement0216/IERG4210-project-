window.currentAppUser = 'Guest'; 

document.addEventListener('DOMContentLoaded',async () => {
    const authLinksContainer = document.getElementById('auth-links');
    if (!authLinksContainer) return;

    try {
        const res = await fetch('/auth/status', { credentials: 'include' });
        const data = await res.json();
        window.currentAppUser = data.username;
        let html = '';
        if (data.loggedIn) {
            html = `
                <span>Welcome, ${data.username}!</span>
                ${data.isAdmin ? '<a href="/productsCRUD">Products CRUD</a>' : ''}
                ${data.isAdmin ? '<a href="/categoriesCRUD">Categories CRUD</a>' : ''}
                <a href="#" id="logout-btn">Logout</a>
            `;
        } else {
            html = `
                <a href="/login.html">Login</a>
                <a href="/register.html">Register</a>
            `;
        }
        authLinksContainer.innerHTML = html;


        document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
            e.preventDefault();
            try {

                const csrfRes = await fetch('/csrf-token', { credentials: 'include' });
                const csrfData = await csrfRes.json();
                const currentCsrfToken = csrfData.csrfToken;

                const res = await fetch('/logout', { 
                    method: 'POST',
                    headers: { 'X-CSRF-Token': currentCsrfToken },
                    credentials: 'include',
                });
                if (res.ok) {
                    window.location.href = '/';
                } else {
                    console.error('Logout failed');
                }
            } catch (error) {
                console.error('Error during logout:', error);
            }
        });
    } catch (error) {
        console.error('Error fetching auth status:', error);
    }
});