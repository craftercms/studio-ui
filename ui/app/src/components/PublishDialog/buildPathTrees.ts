/**
 * Represents a node in the tree structure for file system paths
 */
export interface PathTreeNode {
	/** Full path of the node, including leading slash */
	path: string;
	/** Display label for folder nodes, relative to parent's path. Undefined for files and index.xml */
	label?: string;
	/** Child nodes of this node */
	children: PathTreeNode[];
}

/** Tuple containing the array of root trees and a Set of all valid folder paths */
export type TreeBuilderResult = [PathTreeNode[], Array<string>];

/**
 * Builds a tree structure from a list of file paths, grouping them by root directories
 *
 * @param paths - Array of file paths to process
 * @param roots - Optional array of root paths to group files under. If empty, uses natural top-level roots
 * @returns Tuple of [array of root TreeNodes, Set of all folder paths]
 *
 * @example
 * ```typescript
 * const [trees, paths] = buildTrees(
 *   ['/site/website/index.xml', '/site/components/features/id.xml'],
 *   ['/site/website', '/site/components']
 * );
 * // trees will contain two root nodes: one for website and one for components
 * // paths will contain all folder paths in the final tree structure
 * ```
 */
export function buildPathTrees(paths: string[]): TreeBuilderResult;
export function buildPathTrees(paths: string[], roots: string[]): TreeBuilderResult;
export function buildPathTrees(
	paths: string[],
	roots: string[] = ['/site/website', '/site/components', '/site/taxonomy', '/static-assets', '/templates', '/scripts']
): TreeBuilderResult {
	// Normalize paths to ensure leading slashes
	const normalizedPaths = paths.map((p) => (p.startsWith('/') ? p : '/' + p));
	const normalizedRoots = roots.map((r) => (r.startsWith('/') ? r : '/' + r));

	// Group paths by their root or find natural roots
	const pathsByRoot = new Map<string, string[]>();

	if (normalizedRoots.length > 0) {
		// When roots are provided, group paths under their matching root
		normalizedPaths.forEach((path) => {
			const root = normalizedRoots.find((r) => path.startsWith(r));
			if (root) {
				// Path matches a provided root
				if (!pathsByRoot.has(root)) {
					pathsByRoot.set(root, []);
				}
				pathsByRoot.get(root)!.push(path);
			} else {
				// Path doesn't match any root, use its parent directory as natural root
				const segments = path.split('/');
				const naturalRoot = segments.slice(0, -1).join('/');
				if (!pathsByRoot.has(naturalRoot)) {
					pathsByRoot.set(naturalRoot, []);
				}
				pathsByRoot.get(naturalRoot)!.push(path);
			}
		});
	} else {
		// When no roots provided, group by top-level directories
		const topLevelPaths = new Set(normalizedPaths.map((p) => '/' + p.split('/')[1]));

		Array.from(topLevelPaths).forEach((root) => {
			const rootPaths = normalizedPaths.filter((p) => p.startsWith(root));
			if (rootPaths.length > 0) {
				pathsByRoot.set(root, rootPaths);
			}
		});
	}

	const validPaths = new Set<string>();
	const trees = Array.from(pathsByRoot.entries())
		.map(([root, paths]) => buildTreeForRoot(root, paths, validPaths))
		.filter((node) => node !== null) as PathTreeNode[];

	return [trees, Array.from(validPaths)];
}

/**
 * Finds the highest common ancestor path among a list of paths
 *
 * @param paths - Array of paths to find common ancestor for
 * @returns The highest common ancestor path or null if none found
 *
 * @example
 * ```typescript
 * findHighestCommonAncestor([
 *   '/site/website/a.xml',
 *   '/site/website/b.xml'
 * ]) // Returns '/site/website'
 * ```
 */
function findHighestCommonAncestor(paths: string[]): string | null {
	if (!paths.length) return null;

	// Split paths into segments and remove empty segments
	const pathParts = paths.map((p) => p.split('/').filter(Boolean));
	let commonParts = [...pathParts[0]];

	// Find common segments across all paths
	for (let i = 1; i < pathParts.length; i++) {
		const parts = pathParts[i];
		for (let j = 0; j < commonParts.length; j++) {
			if (j >= parts.length || commonParts[j] !== parts[j]) {
				commonParts = commonParts.slice(0, j);
				break;
			}
		}
	}

	return commonParts.length ? '/' + commonParts.join('/') : null;
}

/**
 * Builds a tree structure for a specific root path and its children
 *
 * @param root - The root path to build tree for
 * @param paths - Array of paths that belong under this root
 * @param validPaths - Set to collect all valid folder paths
 * @returns The root TreeNode or null if invalid
 */
function buildTreeForRoot(root: string, paths: string[], validPaths: Set<string>): PathTreeNode | null {
	// Check if root has an index.xml file
	const rootIndexPath = paths.find((p) => p === `${root}/index.xml`);

	// Create root node, using index.xml path if it exists
	const rootNode: PathTreeNode = {
		path: rootIndexPath || root,
		children: []
	};

	// Only add label if not an index.xml file
	if (!rootIndexPath) {
		rootNode.label = root.substring(1);
	}

	if (rootIndexPath) {
		validPaths.add(rootIndexPath);
	}

	// Build the path hierarchy and process children
	const pathHierarchy = buildPathHierarchy(paths.filter((p) => p !== rootIndexPath));
	buildNodeChildren(rootNode, pathHierarchy, paths, validPaths);
	mergeNodes(rootNode, validPaths);

	return rootNode;
}

/**
 * Builds a hierarchy map of parent-child path relationships
 *
 * @param paths - Array of paths to build hierarchy from
 * @returns Map where keys are parent paths and values are arrays of immediate child paths
 */
function buildPathHierarchy(paths: string[]): Map<string, string[]> {
	const hierarchy = new Map<string, string[]>();

	paths.forEach((path) => {
		const segments = path.split('/');
		// Build parent-child relationships for each path segment
		for (let i = segments.length - 1; i > 0; i--) {
			const parentPath = segments.slice(0, i).join('/');
			const childPath = segments.slice(0, i + 1).join('/');
			if (!hierarchy.has(parentPath)) {
				hierarchy.set(parentPath, []);
			}
			if (!hierarchy.get(parentPath)!.includes(childPath)) {
				hierarchy.get(parentPath)!.push(childPath);
			}
		}
	});

	return hierarchy;
}

/**
 * Recursively builds child nodes for a given parent node
 *
 * @param node - Parent node to build children for
 * @param pathHierarchy - Map of parent-child path relationships
 * @param allPaths - Array of all available paths
 * @param validPaths - Set to collect all valid folder paths
 */
function buildNodeChildren(
	node: PathTreeNode,
	pathHierarchy: Map<string, string[]>,
	allPaths: string[],
	validPaths: Set<string>
): void {
	// Handle index.xml paths by removing the suffix for child lookup
	const nodePath = node.path.endsWith('/index.xml') ? node.path.slice(0, -'/index.xml'.length) : node.path;

	// Get child paths, excluding the node's own path
	const childPaths = (pathHierarchy.get(nodePath) || []).filter((childPath) => childPath !== node.path);

	childPaths.forEach((childPath) => {
		const hasIndexXml = allPaths.includes(`${childPath}/index.xml`);
		const isFile = !pathHierarchy.has(childPath);

		// Create child node, using index.xml path if it exists
		const childNode: PathTreeNode = {
			path: hasIndexXml ? `${childPath}/index.xml` : childPath,
			children: []
		};

		// Only add label and process children for folders (not files)
		if (!isFile && !hasIndexXml) {
			childNode.label = childPath.slice(nodePath.length + 1);
			buildNodeChildren(childNode, pathHierarchy, allPaths, validPaths);
		} else if (!isFile) {
			buildNodeChildren(childNode, pathHierarchy, allPaths, validPaths);
		}

		node.children.push(childNode);
	});

	// Sort children alphabetically by path
	node.children.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Recursively merges single-child folder nodes and collects valid paths
 *
 * @param node - Node to process for merging
 * @param validPaths - Set to collect all valid folder paths
 *
 * @example
 * If a folder has only one child folder, they are merged:
 * /a/b/c + /a/b/c/d => /a/b/c/d with label "a/b/c/d"
 */
function mergeNodes(node: PathTreeNode, validPaths: Set<string>): void {
	// Merge single-child folders that aren't index.xml
	while (node.children.length === 1 && node.children[0].label && !node.path.endsWith('/index.xml')) {
		const child = node.children[0];
		if (!child.children.length) break;

		// Merge child into parent
		node.path = child.path;
		node.label = node.label ? `${node.label}/${child.label}` : child.label;
		node.children = child.children;
	}

	// Process children recursively
	node.children.forEach((child) => mergeNodes(child, validPaths));

	// Add to valid paths if it's a folder (has children) or is an index.xml
	if (node.children.length > 0 || node.path.endsWith('/index.xml')) {
		validPaths.add(node.path);
	}
}

// const [trees, paths] = buildPathTrees(
//   [
//     '/site/website/index.xml',
//     '/site/website/entertainment/index.xml',
//     '/site/website/articles/2020/6/coffee-is-good-for-your-health.xml',
//     '/site/website/articles/2020/7/top-books-for-young-women.xml',
//     '/site/components/features/3b9b4776-8f8d-47ea-8124-965d38033d3d.xml',
//     '/site/components/features/30385c55-e0ef-4036-b24d-df6e52458149.xml',
//     '/static-assets/images/coffee-pic.jpg',
//     '/static-assets/images/book-woman-pic.jpg'
//   ],
//   ['/site/website', '/site/components', '/static-assets']
// );
//
// console.log(JSON.stringify({ trees, paths: Array.from(paths) }, null, 2));
