const handleErrorMessages = (err) => {
  let validationErrors = [];

  for (let key of Object.keys(err.errors))
    validationErrors.push({
      property: key,
      error: err.errors[key].message,
    });

  return { error: validationErrors };
};

module.exports = handleErrorMessages;
