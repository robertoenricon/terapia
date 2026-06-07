function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
}

export async function logout() {
    const response = await fetch('/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            Accept: 'text/html',
            'X-CSRF-TOKEN': csrfToken(),
        },
    });

    if (!response.ok) {
        throw new Error('Não foi possível encerrar a sessão.');
    }
}
