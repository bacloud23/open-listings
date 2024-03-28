export const safeText = async (params) => {
    return {
        clean: params.text,
        language: 'ar',
        text: params.text,
    }
}
