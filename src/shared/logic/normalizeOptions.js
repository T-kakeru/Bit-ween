const normalizeOptions = (options = []) => {
  return options.map((option) => {
    if (typeof option === "string") {
      return { label: option, value: option };
    }
    return {
      label: option.label ?? option.value ?? "",
      value: option.value ?? option.label ?? "",
    };
  });
};

export default normalizeOptions;
