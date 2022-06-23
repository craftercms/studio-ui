try {
  // Inform dependencies that module has been loaded
  window.CStudioAuthoring && window.CStudioAuthoring.Module.moduleLoaded('ace', {});
} catch (e) {
  console.warn(e.message);
}
