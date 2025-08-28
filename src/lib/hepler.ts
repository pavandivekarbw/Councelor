export const getErrorMessage = (error: unknown | string): string => {
    if (error === "AuthenticationFailure:Incorrect User Id or Password")
        return "Incorrect Email or Password. Please try again.";
    return "Something went wrong. Please try again later.";
};
