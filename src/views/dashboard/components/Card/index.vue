<template>
  <div class="bg-primary card-item">
    <div class="card-body">
      <div class="card-body-icon">
        <slot name="icon"></slot>
      </div>
      <div class="text-white">
        <h6 class="text-uppercase text-white">{{ title }}</h6>
        <h2 class="text-white mb24">
          <el-statistic
            :value="displayValue"
            :precision="precision"
            :prefix="prefix"
            :suffix="postfix"
            class="card-panel-num"
          >
            <template #prefix v-if="prefix">
              <span style="font-size: 24px; margin-right: 4px">{{ prefix }}</span>
            </template>
            <template #suffix v-if="postfix">
              <span style="font-size: 16px; margin-left: 4px">{{ postfix }}</span>
            </template>
          </el-statistic>
        </h2>
        <div class="badge-box">
          <slot name="badge"></slot>
        </div>
        <div class="card-info">
          <slot name="info"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTransition } from '@vueuse/core'
import { ref, watch } from 'vue'

const props = defineProps( {
  start : {
    type : Number,
    default : 0
  },
  end : {
    type : Number,
    default : 0
  },
  duration : {
    type : Number,
    default : 1500
  },
  title : {
    type : String,
    default : 'Title'
  },
  prefix : {
    type : String,
    default : ''
  },
  postfix : {
    type : String,
    default : ''
  },
  precision : {
    type : Number,
    default : 0
  }
} )

const source = ref( props.start )
const displayValue = useTransition( source, {
  duration : props.duration
} )

// Watch for changes in end value and update source
watch(
  () => props.end,
  newVal => {
    source.value = newVal
  },
  { immediate : true }
)

defineOptions( {
  name : 'Card'
} )
</script>

<style lang="scss">
.text-white {
  color: #fff;
}

// Force white color for el-statistic in cards
.card-item .el-statistic,
.card-item .el-statistic *,
.card-item .el-statistic__content,
.card-item .el-statistic__content *,
.card-item .el-statistic__number,
.card-item .el-statistic__prefix,
.card-item .el-statistic__suffix {
  color: #fff !important;
}

.card-item {
  position: relative;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  flex-direction: column;
  word-wrap: break-word;
  background-color: #fff;
  background-clip: border-box;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 -3px 31px 0 rgb(0 0 0 / 5%), 0 6px 20px 0 rgb(0 0 0 / 2%);
  border: none;
  &.bg-primary {
    background-color: #0085a4;
  }
  &:hover {
    transition: all 0.3s;
    transform: translateY(-6px);
  }
  .card-body {
    -webkit-box-flex: 1;
    flex: 1 1 auto;
    padding: 1.25rem 1.25rem;
    background-image: url('@/assets/imgs/bg-1.png');
    background-size: cover;
    .card-body-icon i {
      font-size: 30px;
      width: 64px;
      height: 64px;
      line-height: 64px;
      text-align: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: inline-block;
      @extend .text-white;
    }
    .text-uppercase {
      font-size: 16px;
      margin-bottom: 16px;
    }
    .mb24 {
      margin-bottom: 24px;
      height: 28px;
      line-height: 28px;
      :deep(.card-panel-num) {
        font-size: 24px;
        display: inline-block;
        --el-statistic-content-color: #fff;
        .el-statistic__content {
          color: #fff !important;
          font-size: 24px;
        }
        .el-statistic__number {
          color: #fff !important;
          font-size: 24px;
          font-weight: 600;
        }
        .el-statistic__prefix,
        .el-statistic__suffix {
          color: #fff !important;
        }
        .el-statistic__prefix span,
        .el-statistic__suffix span {
          color: #fff !important;
        }
      }
    }
    .text-white .mb24 :deep(.el-statistic),
    .text-white .mb24 :deep(.el-statistic__content) {
      --el-statistic-content-color: #fff !important;
      color: #fff !important;
    }
    .badge-box {
      display: inline-block;
    }
    .badge {
      display: inline-block;
      padding: 0.25em 0.4em;
      font-size: 75%;
      font-weight: 500;
      line-height: 1;
      color: #fff;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: 0.25rem;
      &.bg-info {
        background-color: #29bbe3;
      }
      &.bg-danger {
        background-color: #ec536c;
      }
      &.bg-warning {
        background-color: #f5b225;
      }
    }
    .card-info {
      display: inline-block;
      margin-left: 0.5rem;
    }
  }

  // Responsive styles for smaller screens
  @media (max-width: 1600px) {
    margin-bottom: 16px;

    .card-body {
      padding: 1rem 1rem;

      .card-body-icon i {
        font-size: 26px;
        width: 52px;
        height: 52px;
        line-height: 52px;
      }

      .text-uppercase {
        font-size: 14px;
        margin-bottom: 12px;
      }

      .mb24 {
        margin-bottom: 16px;
        height: 24px;
        line-height: 24px;
        :deep(.card-panel-num) {
          font-size: 20px;
          --el-statistic-content-color: #fff;
          .el-statistic__content {
            font-size: 20px;
            color: #fff !important;
          }
          .el-statistic__number {
            font-size: 20px;
            color: #fff !important;
          }
          .el-statistic__prefix,
          .el-statistic__suffix {
            color: #fff !important;
          }
          .el-statistic__prefix span,
          .el-statistic__suffix span {
            color: #fff !important;
          }
        }
      }

      .badge {
        font-size: 70%;
        padding: 0.2em 0.35em;
      }

      .card-info {
        font-size: 13px;
        margin-left: 0.4rem;
      }
    }
  }

  @media (max-width: 1600px) and (max-height: 768px) {
    margin-bottom: 12px;

    .card-body {
      padding: 0.85rem 0.85rem;

      .card-body-icon i {
        font-size: 24px;
        width: 48px;
        height: 48px;
        line-height: 48px;
      }

      .text-uppercase {
        font-size: 13px;
        margin-bottom: 10px;
      }

      .mb24 {
        margin-bottom: 14px;
        height: 22px;
        line-height: 22px;
        :deep(.card-panel-num) {
          font-size: 18px;
          --el-statistic-content-color: #fff;
          .el-statistic__content {
            font-size: 18px;
            color: #fff !important;
          }
          .el-statistic__number {
            font-size: 18px;
            color: #fff !important;
          }
          .el-statistic__prefix,
          .el-statistic__suffix {
            color: #fff !important;
          }
          .el-statistic__prefix span,
          .el-statistic__suffix span {
            color: #fff !important;
          }
        }
      }

      .badge {
        font-size: 65%;
        padding: 0.18em 0.3em;
      }

      .card-info {
        font-size: 12px;
      }
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 10px;

    .card-body {
      padding: 0.75rem 0.75rem;

      .card-body-icon i {
        font-size: 22px;
        width: 44px;
        height: 44px;
        line-height: 44px;
      }

      .text-uppercase {
        font-size: 12px;
        margin-bottom: 8px;
      }

      .mb24 {
        margin-bottom: 12px;
        height: 20px;
        line-height: 20px;
        :deep(.card-panel-num) {
          font-size: 16px;
          --el-statistic-content-color: #fff;
          .el-statistic__content {
            font-size: 16px;
            color: #fff !important;
          }
          .el-statistic__number {
            font-size: 16px;
            color: #fff !important;
          }
          .el-statistic__prefix,
          .el-statistic__suffix {
            color: #fff !important;
          }
          .el-statistic__prefix span,
          .el-statistic__suffix span {
            color: #fff !important;
          }
        }
      }

      .badge {
        font-size: 60%;
        padding: 0.15em 0.25em;
      }

      .card-info {
        font-size: 11px;
      }
    }
  }
}
</style>
