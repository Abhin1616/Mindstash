const authCookieOptions = {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production"
};
export default authCookieOptions;
