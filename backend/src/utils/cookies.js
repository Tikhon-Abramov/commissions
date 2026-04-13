export function setAuthCookie(res, token) {
    res.cookie(process.env.COOKIE_NAME || 'commissions_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
    });
}

export function clearAuthCookie(res) {
    res.clearCookie(process.env.COOKIE_NAME || 'commissions_token', {
        path: '/',
    });
}