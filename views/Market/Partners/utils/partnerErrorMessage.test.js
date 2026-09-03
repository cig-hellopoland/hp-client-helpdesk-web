import getPartnerErrorMessage from './partnerErrorMessage';

describe('getPartnerErrorMessage', () => {
  it('returns a business message from the API response', () => {
    expect(getPartnerErrorMessage({
      data: { message: 'Partner o tym adresie e-mail już istnieje.' },
      status: 409,
    })).toBe('Partner o tym adresie e-mail już istnieje.');
  });

  it('returns a readable message for a server error', () => {
    expect(getPartnerErrorMessage({ data: 'technical error', status: 500 }))
      .toBe('Wystąpił błąd po stronie serwera. Spróbuj ponownie, a jeśli problem się powtórzy, skontaktuj się z administratorem.');
  });

  it('supports an API message stored directly in the error object', () => {
    expect(getPartnerErrorMessage({ message: 'Nie udało się zapisać partnera.' }))
      .toBe('Nie udało się zapisać partnera.');
  });

  it('returns a readable message when there is no server response', () => {
    expect(getPartnerErrorMessage({}))
      .toBe('Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie.');
  });

  it('returns null when there is no error', () => {
    expect(getPartnerErrorMessage(null)).toBeNull();
  });
});
