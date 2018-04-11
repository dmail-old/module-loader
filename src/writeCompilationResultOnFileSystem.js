import { writeFileFromString } from "./writeFileFromString.js"
import { all } from "@dmail/action"

// const writeSourceLocation = ({ code, location }) => {
// 	return `${code}
// //# sourceURL=${location}`
// }

// const writeSourceMapLocation = ({ code, location }) => {
// 	return `${code}
// //# sourceMappingURL=${location}`
// }

export const writeCompilationResultOnFileSystem = ({
	output,
	// sourceMap,
	// inputRelativeLocation,
	outputFolder,
	outputRelativeLocation,
	// sourceMapRelativeLocation
}) => {
	const actions = []

	// sourceURL
	// disabled, let's just disable sourceURL to make things simpler
	// if (inputRelativeLocation) {
	// 	const sourceClientLocation = `/${inputRelativeLocation}`
	// 	output = writeSourceLocation({ code: output, location: sourceClientLocation })
	// }

	// sourceMap
	// disabled, let's just disable sourceMap to make things simpler
	// if (typeof sourceMap === "object" && sourceMapRelativeLocation) {
	// 	// delete sourceMap.sourcesContent
	// 	// we could remove sources content, they can be fetched from server
	// 	// but removing them will decrease size of sourceMap but force
	// 	// the client to fetch the source resulting in an additional http request

	// 	// the client wont be able to fecth a sourceMapServerLocation like
	// 	// /Users/damien/dev/github/dev-server/src/__test__/build/transpiled/file.js
	// 	// so assuming server serve file at /Users/damien/dev/github/dev-server/src/__test__ it becomes
	// 	// /build/transpiled/file.js
	// 	const sourceMapServerLocation = `${outputFolder}/${sourceMapRelativeLocation}`
	// 	const sourceMapClientLocation = `/${sourceMapRelativeLocation}`
	// 	// we could delete sourceMap.sourceRoot to ensure clientLocation is absolute
	// 	// but it's not set anyway because not passed to babel during compilation

	// 	output = writeSourceMapLocation({ code: output, location: sourceMapClientLocation })
	// 	actions.push(
	// 		writeFileFromString({
	// 			location: sourceMapServerLocation,
	// 			string: JSON.stringify(sourceMap)
	// 		})
	// 	)
	// }

	// output
	actions.push(
		writeFileFromString({
			location: `${outputFolder}/${outputRelativeLocation}`,
			string: output
		})
	)

	return all(actions).then(() => output)
}
