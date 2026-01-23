import { useCallback, useMemo, useState } from "react";

const toggleItem = (items, item) => {
  const current = Array.isArray(items) ? items : [];
  return current.includes(item) ? current.filter((x) => x !== item) : [...current, item];
};

export const useAdditionalConditions = () => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) => toggleItem(prev, tag));
  }, []);

  const toggleDepartment = useCallback((department) => {
    setSelectedDepartments((prev) => toggleItem(prev, department));
  }, []);

  const toggleCategory = useCallback((category) => {
    setSelectedCategories((prev) => toggleItem(prev, category));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedTags([]);
    setSelectedDepartments([]);
    setSelectedCategories([]);
  }, []);

  const chips = useMemo(() => {
    const result = [];

    for (const value of selectedCategories) {
      result.push({ key: `category:${value}`, kind: "category", value, label: value });
    }

    for (const value of selectedDepartments) {
      result.push({ key: `department:${value}`, kind: "department", value, label: value });
    }

    for (const value of selectedTags) {
      result.push({ key: `tag:${value}`, kind: "tag", value, label: `#${value}` });
    }

    return result;
  }, [selectedCategories, selectedDepartments, selectedTags]);

  const removeChip = useCallback((chip) => {
    switch (chip?.kind) {
      case "category":
        setSelectedCategories((prev) => prev.filter((x) => x !== chip.value));
        break;
      case "department":
        setSelectedDepartments((prev) => prev.filter((x) => x !== chip.value));
        break;
      case "tag":
        setSelectedTags((prev) => prev.filter((x) => x !== chip.value));
        break;
      default:
        break;
    }
  }, []);

  return {
    selectedTags,
    selectedDepartments,
    selectedCategories,
    toggleTag,
    toggleDepartment,
    toggleCategory,
    chips,
    removeChip,
    clearAll,
  };
};
