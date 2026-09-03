const getText = value => (
  typeof value === 'string' && value.trim() ? value.trim() : null
);

const getPartnerErrorMessage = (requestError) => {
  if (!requestError) {
    return null;
  }

  const { data, status } = requestError;
  const directMessage = getText(requestError.message);
  const apiMessage = data && typeof data === 'object' ? getText(data.message) : null;

  if (apiMessage || directMessage) {
    return apiMessage || directMessage;
  }

  if (status === 400 || status === 409) {
    const responseText = getText(data);

    if (responseText) {
      return responseText;
    }
  }

  if (status === 401) {
    return 'Sesja wygasła. Zaloguj się ponownie i spróbuj jeszcze raz.';
  }

  if (status === 403) {
    return 'Nie masz uprawnień do zapisania partnera.';
  }

  if (status >= 500) {
    return 'Wystąpił błąd po stronie serwera. Spróbuj ponownie, a jeśli problem się powtórzy, skontaktuj się z administratorem.';
  }

  if (!status) {
    return 'Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie.';
  }

  return `Nie udało się zapisać partnera (kod HTTP ${status}).`;
};

export default getPartnerErrorMessage;
