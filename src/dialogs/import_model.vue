/* Web Lic - Copyright (C) 2018 Remi Gagne */

<template>
	<licDialog
		:title="tr('dialog.import_model.title')"
		class="importModelDialog"
		width="630px"
	>
		<el-row v-if="includePartsPerStep">
			<span>{{tr('dialog.import_model.parts_per_step_1')}}</span>
			<input
				v-model.number="newState.partsPerStep"
				min="1"
				type="number"
				class="form-control parts-per-step"
			>
			<span>{{tr('dialog.import_model.parts_per_step_2')}}</span>
		</el-row>
		<el-row>
			<span>{{tr('dialog.import_model.steps_per_page')}}</span>
			<input
				v-model.number="newState.stepsPerPage"
				:disabled="newState.useMaxSteps"
				min="1"
				max="10"
				type="number"
				class="form-control"
			>
			<el-checkbox
				v-model="newState.useMaxSteps"
				:label="tr('dialog.import_model.use_max_steps')"
				data-testid="import-use-max-steps"
			/>
		</el-row>
		<el-row>
			<el-dropdown
				:hide-on-click="false"
				data-testid="import-include-dropdown"
				trigger="click"
				placement="bottom-start"
				@command="checkIncludeItem"
			>
				<span class="el-dropdown-link">{{tr('dialog.import_model.include.root')}}</span>
				<el-dropdown-menu slot="dropdown" class="includeDropDown">
					<template v-for="(checked, item) in newState.include">
						<el-dropdown-item
							:key="`include_${item}`"
							:command="item"
							:data-testid="`include-${item}`"
						>
							{{tr(`dialog.import_model.include.${item}`)}}
							<i v-if="checked" class="fas fa-check"/>
						</el-dropdown-item>
					</template>
				</el-dropdown-menu>
			</el-dropdown>
		</el-row>
		<span slot="footer" class="dialog-footer">
			<el-button
				type="primary"
				data-testid="import-ok"
				@click="ok()"
			>
				{{tr("dialog.ok")}}
			</el-button>
		</span>
	</licDialog>
</template>

<script>

import uiState from '../ui_state';

export default {
	data: function() {
		return {
			includePartsPerStep: false,
			newState: uiState.get('dialog.importModel')
		};
	},
	methods: {
		checkIncludeItem(item) {
			this.newState.include[item] = !this.newState.include[item];
		},
		ok() {
			this.$emit('ok', this.newState);
			this.$emit('close');
		}
	}
};
</script>

<style>

.importModelDialog .el-dialog__body {
	padding: 0;
}

.importModelDialog .el-row {
	margin: 20px;
}

.importModelDialog .el-checkbox+.el-checkbox {
	margin-left: 15x;
}

.importModelDialog .el-dropdown {
	font-size: 14px;
	padding: 6px 12px;
}

.importModelDialog input {
	display: inline;
	width: 80px;
	margin: 0 20px 0 10px;
}

.importModelDialog input.parts-per-step {
	margin: 0 5px;
}

.includeDropDown {
	min-width: 320px;
}

.includeDropDown i {
	padding-top: 8px;
}

</style>
