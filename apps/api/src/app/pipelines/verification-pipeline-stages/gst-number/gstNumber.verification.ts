// TODO: this is mock implementation of GST number verification, call api in production
export const gstNumberVerification = async (
  gstNumber: string,
): Promise<boolean> => {
  return new Promise((resolve, _reject) => {
    setTimeout(
      () => {
        // Mock GST verification API
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

        if (gstNumber && gstRegex.test(gstNumber)) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      Math.random() * 1000 + 500,
    );
  });
};
