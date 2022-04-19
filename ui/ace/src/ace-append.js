try {
  // Inform dependencies that module has been loaded
  CStudioAuthoring && CStudioAuthoring.Module.moduleLoaded('ace', {});
} catch (e) {
  console.warn(e.message);
}
