import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import { useBlockProps } from '@wordpress/block-editor';
import { DropZone } from '@wordpress/components';
import { useState } from '@wordpress/element';
import * as XLSX from 'xlsx';

import './editor.scss';

function save({ attributes }) {
	if (attributes.json_encoded_sheet != null) {
		return Render_Json(attributes.json_encoded_sheet)
	} else {
		return null
	}
}

function Edit({ attributes, setAttributes }) {
	const [ hasfiles, sethasfiles ] = useState(attributes.json_encoded_sheet != null ? true : false)
	function Parse_XLSX(files) {
		files.forEach(file => {
			var reader = new FileReader();
			reader.readAsArrayBuffer(file);
			reader.onload = _ => {
				var data = new Uint8Array(reader.result);
				var wb = XLSX.read(data, { type:'array' });
				wb.SheetNames.every(sheet_name => {
					setAttributes({
						json_encoded_sheet : XLSX.utils.sheet_to_json(wb.Sheets[sheet_name])
					});
					sethasfiles(true);
					return false;
				});
			};
		});
	};
	if (hasfiles) {
		return <section {...useBlockProps({ className : "excel-sheet" })}>
			{ Render_Json(attributes.json_encoded_sheet) }
			<DropZone onFilesDrop={ Parse_XLSX }></DropZone>
		</section>
	} else {
		return <section {...useBlockProps({ className : "empty-drop-zone" })}>
			Drop files here
			<DropZone onFilesDrop={ Parse_XLSX }></DropZone>
		</section>
	}
}

function Render_Json(json) {
	return <table>
		<tr>{Object.keys(json[0]).map(key => <th>{key}</th>)}</tr>
		{
			json.map((data) => {
				return <tr>
					{
						Object.values(data).map((value) => {
							return <td>{value}</td>
						})
					}
				</tr>
			})
		}
	</table>
}

registerBlockType('michael-van-straten/excel-converter-plugin', {
	attributes : {
		json_encoded_sheet : []
	},
	edit: Edit,
	save,
});