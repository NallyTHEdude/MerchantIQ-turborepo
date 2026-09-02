// TODO: this is mock implementation of phone number verification, call api in production

export const verifyPhoneNumber = async (
  phoneNumber: string,
): Promise<boolean> => {
  return new Promise((resolve, _reject) => {
    // Simulate an API call
    setTimeout(
      () => {
        if (phoneNumber && phoneNumber.length === 10) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      Math.random() * 1000 + 500,
    );
  });
};
