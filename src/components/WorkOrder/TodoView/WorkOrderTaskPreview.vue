<template>
  <div class="work-order-task-preview">
    <!-- Task Header Info -->
    <div class="task-header">
      <div class="task-title">{{ task.task_name || task.name }}</div>
      <div v-if="task.description" class="task-description">
        {{ task.description }}
      </div>
      <div class="task-meta">
        <div v-if="task.estimated_minutes" class="meta-item">
          <el-icon><Clock /></el-icon>
          <span>{{ task.estimated_minutes }} minutes</span>
        </div>
        <div v-if="task.minutes_taken" class="meta-item">
          <el-icon><Timer /></el-icon>
          <span>{{ task.minutes_taken }} minutes taken</span>
        </div>
      </div>
    </div>

    <!-- Steps Preview -->
    <div v-if="task.steps && task.steps.length > 0" class="steps-section">
      <h4 class="steps-title">Task Steps ({{ task.steps.length }})</h4>

      <div class="steps-list">
        <div v-for="(step, index) in task.steps" :key="step.id || index" class="step-card">
          <!-- Step Header -->
          <div class="step-header">
            <span class="step-number">{{ index + 1 }}</span>
            <div class="step-info">
              <div class="step-name">{{ step.name }}</div>
              <div v-if="step.description" class="step-description">
                {{ step.description }}
              </div>
            </div>
            <div class="step-badges">
              <el-tag v-if="step.required" type="danger" size="small">Required</el-tag>
              <el-tag :type="getStepTypeTag(step.type)" size="small">{{ getStepTypeLabel(step.type) }}</el-tag>
            </div>
          </div>

          <!-- Step Value Display -->
          <div v-if="step.value" class="step-value">
            <div class="value-container">
              <!-- Numeric Field -->
              <div v-if="step.type === 'numeric_field'" class="numeric-value">
                <div class="value-display">
                  <span class="value-number">{{ step.value.value }}</span>
                  <span v-if="step.value.has_upper_limit" class="limit-info">
                    (Max: {{ step.value.upper_limit }})
                  </span>
                  <span v-if="step.value.has_lower_limit" class="limit-info">
                    (Min: {{ step.value.lower_limit }})
                  </span>
                </div>
              </div>

              <!-- Boolean Field -->
              <div v-else-if="step.type === 'boolean_field'" class="boolean-value">
                <el-tag :type="step.value.value ? 'success' : 'danger'">
                  {{ step.value.value ? 'Yes' : 'No' }}
                </el-tag>
              </div>

              <!-- Text Field -->
              <div v-else-if="step.type === 'text_field'" class="text-value">
                <div class="text-content">{{ step.value.value || 'No input provided' }}</div>
              </div>

              <!-- File Field -->
              <div v-else-if="step.type === 'file_field'" class="file-value">
                <div v-if="step.value.files && step.value.files.length > 0" class="file-list">
                  <div v-for="file in step.value.files" :key="file.name" class="file-item">
                    <el-icon><Document /></el-icon>
                    <span>{{ file.name }}</span>
                  </div>
                </div>
                <div v-else class="no-files">No files uploaded</div>
              </div>

              <!-- Default/Unknown Type -->
              <div v-else class="unknown-value">
                <span class="value-text">{{ JSON.stringify(step.value.value) }}</span>
              </div>

              <!-- Image Requirements -->
              <div v-if="step.value.require_image" class="image-requirement">
                <el-tag type="warning" size="small">
                  <el-icon><Camera /></el-icon>
                  Image Required
                </el-tag>
                <div v-if="step.value.image && step.value.image.length > 0" class="uploaded-images">
                  <div v-for="(image, imgIndex) in step.value.image" :key="imgIndex" class="image-preview">
                    <el-image
                      :src="image.url || image"
                      fit="cover"
                      style="width: 60px; height: 60px; border-radius: 4px"
                      :preview-src-list="step.value.image.map(img => img.url || img)"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step Tools -->
          <div v-if="step.tools && step.tools.length > 0" class="step-tools">
            <div class="tools-header">Required Tools:</div>
            <div class="tools-list">
              <el-tag v-for="tool in step.tools" :key="tool.id || tool.name" size="small" type="info" class="tool-tag">
                <el-icon><Tools /></el-icon>
                {{ tool.name }}
              </el-tag>
            </div>
          </div>

          <!-- Step Remarks -->
          <div v-if="step.remarks" class="step-remarks">
            <div class="remarks-header">Remarks:</div>
            <div class="remarks-content">{{ step.remarks }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Steps State -->
    <div v-else class="no-steps">
      <el-empty description="No steps defined for this task" :image-size="80" />
    </div>
  </div>
</template>

<script setup>
// import { computed } from 'vue' // Removed unused import
import { Clock, Timer, Document, Camera, Picture, Tools } from '@element-plus/icons-vue'

defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const getStepTypeLabel = type => {
  const typeMap = {
    numeric_field: 'Number',
    boolean_field: 'Yes/No',
    text_field: 'Text',
    file_field: 'File',
    inspection: 'Inspection',
  }
  return typeMap[type] || type
}

const getStepTypeTag = type => {
  const tagMap = {
    numeric_field: 'primary',
    boolean_field: 'success',
    text_field: 'info',
    file_field: 'warning',
    inspection: 'danger',
  }
  return tagMap[type] || 'default'
}

defineOptions({
  name: 'WorkOrderTaskPreview',
})
</script>

<style scoped lang="scss">
.work-order-task-preview {
  padding: 16px;
  max-height: 70vh;
  overflow-y: auto;

  .task-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-light);

    .task-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .task-description {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      line-height: 1.5;
      margin-bottom: 12px;
    }

    .task-meta {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--el-text-color-regular);

        .el-icon {
          color: var(--el-color-primary);
        }
      }
    }
  }

  .steps-section {
    .steps-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .step-card {
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        padding: 16px;
        background: var(--el-fill-color-extra-light);

        .step-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;

          .step-number {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background: var(--el-color-primary);
            color: white;
            border-radius: 50%;
            font-size: 12px;
            font-weight: 600;
            flex-shrink: 0;
          }

          .step-info {
            flex: 1;
            min-width: 0;

            .step-name {
              font-size: 14px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              margin-bottom: 4px;
            }

            .step-description {
              font-size: 13px;
              color: var(--el-text-color-secondary);
              line-height: 1.4;
            }
          }

          .step-badges {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }
        }

        .step-value {
          margin-bottom: 12px;

          .value-container {
            background: var(--el-bg-color);
            border-radius: 6px;
            padding: 12px;

            .numeric-value {
              .value-display {
                display: flex;
                align-items: center;
                gap: 8px;

                .value-number {
                  font-size: 18px;
                  font-weight: 600;
                  color: var(--el-color-primary);
                }

                .limit-info {
                  font-size: 12px;
                  color: var(--el-text-color-secondary);
                }
              }
            }

            .boolean-value,
            .text-value,
            .file-value,
            .unknown-value {
              .text-content {
                font-size: 14px;
                color: var(--el-text-color-primary);
                background: var(--el-fill-color-lighter);
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid var(--el-border-color-lighter);
              }

              .file-list {
                display: flex;
                flex-direction: column;
                gap: 6px;

                .file-item {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 13px;
                  color: var(--el-text-color-regular);
                }
              }

              .no-files {
                font-size: 13px;
                color: var(--el-text-color-secondary);
                font-style: italic;
              }

              .value-text {
                font-size: 13px;
                color: var(--el-text-color-regular);
                font-family: monospace;
              }
            }

            .image-requirement {
              margin-top: 12px;

              .uploaded-images {
                display: flex;
                gap: 8px;
                margin-top: 8px;
                flex-wrap: wrap;

                .image-preview {
                  border-radius: 4px;
                  overflow: hidden;

                  .image-error {
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--el-fill-color-light);
                    color: var(--el-text-color-secondary);
                  }
                }
              }
            }
          }
        }

        .step-tools {
          margin-bottom: 12px;

          .tools-header {
            font-size: 13px;
            font-weight: 500;
            color: var(--el-text-color-regular);
            margin-bottom: 8px;
          }

          .tools-list {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;

            .tool-tag {
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }

        .step-remarks {
          .remarks-header {
            font-size: 13px;
            font-weight: 500;
            color: var(--el-text-color-regular);
            margin-bottom: 6px;
          }

          .remarks-content {
            font-size: 13px;
            color: var(--el-text-color-secondary);
            background: var(--el-fill-color-lighter);
            padding: 8px 12px;
            border-radius: 4px;
            border-left: 3px solid var(--el-color-warning);
          }
        }
      }
    }
  }

  .no-steps {
    padding: 40px 20px;
    text-align: center;
  }
}

// Custom scrollbar
.work-order-task-preview::-webkit-scrollbar {
  width: 6px;
}

.work-order-task-preview::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 3px;
}

.work-order-task-preview::-webkit-scrollbar-thumb {
  background: var(--el-fill-color-dark);
  border-radius: 3px;

  &:hover {
    background: var(--el-fill-color-darker);
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .work-order-task-preview {
    padding: 12px;

    .task-header {
      .task-title {
        font-size: 16px;
      }

      .task-meta {
        gap: 12px;

        .meta-item {
          font-size: 12px;
        }
      }
    }

    .steps-section {
      .steps-title {
        font-size: 14px;
      }

      .steps-list {
        gap: 12px;

        .step-card {
          padding: 12px;

          .step-header {
            gap: 8px;

            .step-number {
              width: 20px;
              height: 20px;
              font-size: 11px;
            }

            .step-info {
              .step-name {
                font-size: 13px;
              }

              .step-description {
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
