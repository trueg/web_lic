/* Web Lic - Copyright (C) 2018 Remi Gagne */

<template>
	<licDialog
		:title="tr('dialog.merge_parts.title')"
		class="mergePartsDialog"
		width="630px"
	>
		<div
			class="subheading"
			v-html="tr('dialog.merge_parts.subtitle')"
		/>
		<el-row
			v-for="(part, index) in mergePartsData"
			:key="part.name"
			class="mergePartRow"
		>
			<div class="mergePartCol">
				<div
					v-for="subPart in part.parts"
					:key="subPart.filename"
				>
					{{tr(`dialog.merge_parts.merge_part_list.${part.name}.sub_parts.${subPart.name}`)}}
				</div>
			</div>
			<i class="mergePartCol fas fa-angle-double-right fa-lg"/>
			<el-checkbox
				v-model="partsToBeMerged[index].merge"
				:label="tr(`dialog.merge_parts.merge_part_list.${part.name}.name`)"
				class="mergePartCol"
			/>
		</el-row>
		<span slot="footer" class="dialog-footer">
			<el-button type="primary" @click="ok()">{{tr("dialog.ok")}}</el-button>
		</span>
	</licDialog>
</template>

<script>

import _ from '../util';
import store from '../store';
import LDParse from '../LDParse';

function mergeableIsEqual(a, b) {
	return a.name === b.name;
}

function buildMergePartsTable() {
	// TODO: If a sub part is not used in the model, remove that subpart from the display list
	// const mergeablePartList = Object.keys(LDParse.mergeableParts);
	let mergeableEntries = _.uniqWith(Object.values(LDParse.mergeableParts), mergeableIsEqual);
	mergeableEntries = _.cloneDeep(mergeableEntries);
	return mergeableEntries;
}

export default {
	data: function() {
		const mergePartsData = buildMergePartsTable();
		return {
			mergePartsData,
			partsToBeMerged: mergePartsData.map(el => ({name: el.name, merge: false}))
		};
	},
	methods: {
		ok() {
			this.partsToBeMerged
				.filter(el => el.merge)
				.forEach(el => {
					LDParse.model.mergeParts(store.model, el.name);
				});
			this.$emit('ok');
			this.$emit('close');
		}
	}
};
</script>

<style>

.mergePartsDialog .el-dialog__body {
	padding-bottom: 0;
}

.mergePartRow {
	display: flex;
	align-items: center;
	border-bottom: 1px solid #e5e5e5;
}

.mergePartRow:last-of-type {
	border: none;
}

.mergePartCol {
	margin: 15px;
}

</style>
