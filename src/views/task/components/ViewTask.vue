<template>
  <div class="view-container">
    <el-card style="flex: 1">
      <div class="header-container">
        <el-text size="large" tag="b" class="w-150px mb-2">Work Order Name: {{ wo.name }}</el-text>
        <div class="header-right">
          <el-text>Due Date: {{ convertToLocalTime(wo.due_date) }}</el-text>
          <div>
            <el-link style="margin-left: 10px" type="primary" @click="handleSelectedWorkorder">WO Details</el-link>
          </div>
        </div>
      </div>
      <AssignPersonnel
        v-if="assignPersonnel == true"
        @close="handleCloseRequest"
        :wo="wo"
        :personnelList="personnel"
        :supervisorList="supervisor"
        :type="listType"
      />
      <div class="inner-container" v-if="assignPersonnel == false">
        <div class="personnel-container">
          <div class="supervisor-container">
            <el-card class="card-shadow">
              <div class="card-header">
                <el-text size="large">Approving Supervisor</el-text>
                <hr />
              </div>
              <div class="card-body">
                <div class="personnel-card">
                  <el-icon><Avatar /></el-icon>
                  <el-text
                    >{{ supervisor.find(s => s.assigned === 1).firstName }}
                    {{ supervisor.find(s => s.assigned === 1).lastName }}</el-text
                  >
                </div>
              </div>
              <div class="assign-button">
                <el-button @click="handleAssign(2)"
type="primary"
size="small"
round
                  >Assign Supervisor &rarr;</el-button
                >
              </div>
            </el-card>
          </div>

          <div class="technician-container">
            <el-card class="card-shadow">
              <div class="card-header">
                <el-text size="large">Maintenance Personnel</el-text>
                <hr />
              </div>
              <div class="card-body">
                <el-breadcrumb separator="/">
                  <el-breadcrumb-item v-for="p in personnel.filter(p => p.assigned == 1)" :key="p.id">
                    <el-icon><User /></el-icon>
                    {{ p.firstName }} {{ p.lastName }}</el-breadcrumb-item
                  >
                </el-breadcrumb>
              </div>
              <div class="assign-button">
                <el-button @click="handleAssign(1)"
type="primary"
size="small"
round
                  >Assign Personnel &rarr;</el-button
                >
              </div>
            </el-card>
          </div>

          <div class="task-container">
            <el-card class="card-shadow">
              <div class="card-header">
                <el-text size="large">Task List</el-text>
                <hr />
              </div>
              <div class="task-card-body">
                <ul class="task-list">
                  <li @click="selectTask(index)" class="task-card" v-for="(task, index) in tasks" :key="index">
                    <el-card style="width: 100%; display: flex; flex-direction: row; flex-wrap: nowrap">
                      <el-text :type="selectedTask === index ? 'primary' : 'info'">
                        <span>{{ index + 1 }}. {{ task.task_name }}</span>
                        <span v-if="selectedTask === null"> : {{ task._id }} </span>
                      </el-text>
                    </el-card>
                  </li>
                </ul>
                <div v-if="selectedTask >= 0 && selectedTask != null" class="steps-card">
                  <el-card class="card-shadow">
                    <div class="step-card">
                      <div class="step-header">
                        <div style="display: flex; flex-direction: row; justify-content: space-between">
                          <el-text class="mx-1" size="small">{{ tasks[selectedTask]._id }}</el-text>
                          <el-button
                            @click="selectedTask = null"
                            :icon="Minus"
                            size="small"
                            circle
                            class="minus-style"
                          />
                        </div>
                        <el-text size="large">Steps</el-text>
                        <hr />
                      </div>
                      <ul class="step-list">
                        <li class="step-card" v-for="(step, index) in tasks[selectedTask].steps" :key="index">
                          <el-text size="small">{{ index + 1 }}. {{ step.name }}</el-text>
                        </li>
                      </ul>
                    </div>
                  </el-card>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue'
import router from '../../../router/index'
import { Minus, Avatar, User } from '@element-plus/icons-vue'
import AssignPersonnel from './AssignPersonnel.vue'
import { convertToLocalTime } from '../../../utils/datetime'

const woData = defineProps( {
  wo : Object,
  height : String,
  personnelList : Object,
  supervisorList : Object
} )

const assignPersonnel = ref( false )

const listType = ref( 1 )

const personnel = reactive( woData.personnelList )

const supervisor = computed( () => {
  return woData.supervisorList
} )

const tasks = [
  {
    _id : '20241223-T-1-2--111033',
    task_name : 'Inspect Steam Peeler Unit',
    estimated_minutes : null,
    minutes_taken : null,
    work_order_id : 2994,
    steps : [
      {
        name : '加速带-电机温度',
        type : 'numeric_field',
        description : '温度≤50℃、无异响',
        required : true,
        remarks : null,
        value : {
          value : 27,
          has_lower_limit : false,
          lower_limit : null,
          has_upper_limit : true,
          upper_limit : 49,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '加速带-齿轮箱',
        type : 'numeric_field',
        description : '无异响、无漏油、温度≤50℃',
        required : true,
        remarks : null,
        value : {
          value : 25,
          has_lower_limit : false,
          lower_limit : null,
          has_upper_limit : true,
          upper_limit : 50,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '加速带-接油盘',
        type : 'inspection',
        description : '无变形、无缺失、无润滑油',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '加速带-驱动轴承',
        type : 'inspection',
        description : '润滑良好、无过度润滑、无异响',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '加速带-卷筒',
        type : 'inspection',
        description : '转动灵活，无异响、无卡顿',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '加速带-皮带',
        type : 'inspection',
        description :
          '运行平稳，上下皮带运行跑偏量≤10mm、无颤抖 无磨损、无划伤、无穿孔、无撕裂 边缘整齐无毛边、磨损情况≤5mm',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '加速带-挡板',
        type : 'inspection',
        description : '不磨皮带，固定螺丝无缺失，挡皮无破损，刮板距离皮带高度3-4mm',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '加速带-与相邻设备距离',
        type : 'inspection',
        description : '无摩擦碰撞',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-电机温度',
        type : 'numeric_field',
        description : '温度≤50℃、无异响',
        required : true,
        remarks : null,
        value : {
          value : 27,
          has_lower_limit : false,
          lower_limit : null,
          has_upper_limit : true,
          upper_limit : 50,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '主皮带-齿轮箱',
        type : 'numeric_field',
        description : '无异响、无漏油、温度≤50℃',
        required : true,
        remarks : null,
        value : {
          value : 46,
          has_lower_limit : false,
          lower_limit : null,
          has_upper_limit : true,
          upper_limit : 50,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '主皮带-接油盘',
        type : 'inspection',
        description : '无变形、无缺失、无润滑油',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-驱动轴承',
        type : 'inspection',
        description : '润滑良好、无过度润滑、无异响',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '主皮带-卷筒',
        type : 'inspection',
        description : '转动灵活，无异响、无卡顿',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '主皮带-皮带',
        type : 'inspection',
        description :
          '运行平稳，上下皮带运行跑偏量≤10mm、无颤抖 无磨损、无划伤、无穿孔、无撕裂 边缘整齐无毛边、磨损情况≤5mm',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-挡板',
        type : 'inspection',
        description : '不磨皮带，固定螺丝无缺失，挡皮无破损，刮板距离皮带高度3-4mm',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-与相邻设备距离',
        type : 'inspection',
        description : '无摩擦碰撞',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '显示屏幕',
        type : 'inspection',
        description : '界面无报警，无损坏',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '灯光',
        type : 'inspection',
        description : '灯管无损坏',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '镜头反光镜',
        type : 'inspection',
        description : '表面干净、无损坏',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '气枪头',
        type : 'inspection',
        description : '无堵塞、无松动',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '压缩空气',
        type : 'inspection',
        description : '无泄漏、气管无老化',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机',
        type : 'inspection',
        description : '无报警，温度在设定范围内、无异响',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      }
    ],
    personnel : [
      {
        participated : true,
        full_name : '马 艺晨',
        id : 98
      },
      {
        participated : false,
        full_name : '张 晓军',
        id : 99
      },
      {
        participated : false,
        full_name : '王 佩彦',
        id : 86
      },
      {
        participated : false,
        full_name : '马 旭康',
        id : 93
      }
    ],
    start_date : 1734969600000,
    end_date : null,
    created_at : 1734914639515,
    updated_at : 1735108652640,
    created_by : 86,
    updated_by : 98,
    module : 200,
    production_line_id : null,
    equipment_group_id : null,
    equipment_id : null,
    component_id : null,
    task_recurrence_id : 'cc85d422-cb95-4212-8566-47272deee4e2',
    total_steps : null,
    completed_steps : null,
    template_id : '67636ce59d543e6ffb5c74fb',
    state : 7
  },
  {
    _id : '20241223-T-1-2--163867',
    task_name : 'Inspect Conveyor Unit',
    estimated_minutes : null,
    minutes_taken : null,
    work_order_id : 2994,
    steps : [
      {
        name : '入料皮带（南侧）-与相邻设备距离',
        type : 'inspection',
        description : '无摩擦碰撞',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '入料皮带（南侧）-风扇罩',
        type : 'inspection',
        description : '扇叶无污垢，无水渍',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '入料皮带（南侧）-电机温度',
        type : 'numeric_field',
        description : '温度≤65℃、无异响',
        required : true,
        remarks : null,
        value : {
          value : 35,
          has_lower_limit : false,
          lower_limit : null,
          has_upper_limit : true,
          upper_limit : 65,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '入料皮带（南侧）-齿轮箱',
        type : 'numeric_field',
        description : '无异响、无漏油、温度≤50℃',
        required : true,
        remarks : null,
        value : {
          value : 30,
          has_lower_limit : false,
          lower_limit : 0,
          has_upper_limit : true,
          upper_limit : 50,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '入料皮带（南侧）-减震垫',
        type : 'inspection',
        description : '无破损、无裂纹、无变形',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '入料皮带（南侧）-轴承',
        type : 'inspection',
        description : '润滑良好、无过度润滑、无异响',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '入料皮带（南侧）-接油盘',
        type : 'inspection',
        description : '清洁无污物',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '入料皮带（南侧）-维修开关',
        type : 'inspection',
        description : '螺栓无缺失，外壳无损坏、格兰头无松动，表面无水渍',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14a24e5f102bec25cd28',
            name : '摸'
          }
        ]
      },
      {
        name : '入料皮带（南侧）-输送带',
        type : 'inspection',
        description : '运行平稳、无颤抖、粘料，下层输送带不得与积料摩擦,边缘整齐无毛边,两侧接头无开裂、无断裂',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '入料皮带（南侧）-挡板',
        type : 'inspection',
        description : '无变形、不磨皮带，不漏产品',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '入料皮带（南侧）-主架螺栓',
        type : 'inspection',
        description : '紧固无松动、无缺失',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（皮带南侧）-柜门',
        type : 'inspection',
        description : '柜门关严锁紧，密封良好无进水、内部卫生干净',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（皮带南侧）-开关、按钮',
        type : 'inspection',
        description : '接线无松动，线缆无变色',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（皮带南侧）-滤水器',
        type : 'inspection',
        description : '无堵塞，无漏水，无损坏',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（皮带南侧）-电磁阀',
        type : 'inspection',
        description : '接头无漏气、备件无损坏',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（皮带南侧）-气压检查',
        type : 'numeric_field',
        description : '压力表无破损，确认输入压力>6bar(90 psi)',
        required : true,
        remarks : null,
        value : {
          value : 6,
          has_lower_limit : true,
          lower_limit : 6,
          has_upper_limit : false,
          upper_limit : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（皮带南侧）-气压检查',
        type : 'numeric_field',
        description : '分拣指气压为3.5bar(52 psi)',
        required : true,
        remarks : null,
        value : {
          value : 3.5,
          has_lower_limit : true,
          lower_limit : 3.5,
          has_upper_limit : true,
          upper_limit : 3.5,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（皮带南侧）-气压检查',
        type : 'numeric_field',
        description : '擦拭器气压为4 bar(60 psi)',
        required : true,
        remarks : null,
        value : {
          value : 4,
          has_lower_limit : true,
          lower_limit : 4,
          has_upper_limit : true,
          upper_limit : 4,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（皮带南侧）-气压检查',
        type : 'numeric_field',
        description : '外壳气压为0.25bar(3.5 psi)',
        required : true,
        remarks : null,
        value : {
          value : 0.25,
          has_lower_limit : true,
          lower_limit : 0.25,
          has_upper_limit : true,
          upper_limit : 0.25,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（皮带南侧）-气压检查',
        type : 'numeric_field',
        description : '空气弹簧压力1.28Bar(18 psi)',
        required : true,
        remarks : null,
        value : {
          value : 1.28,
          has_lower_limit : true,
          lower_limit : 1.28,
          has_upper_limit : true,
          upper_limit : 1.28,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（皮带南侧）-加注润滑器油槽',
        type : 'inspection',
        description : '无缺油　加注TOMRA 食品级轻油 P/N 901810 ',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（皮带南侧）-储油瓶',
        type : 'inspection',
        description : '储油量不能最低油位刻度线，吸油管能吸到油',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（皮带南侧）-供气和供水软管及接头',
        type : 'inspection',
        description : '供气、供水软管无破裂、无扭曲，接头无漏水漏气',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '擦拭器组件-擦拭器刮刀',
        type : 'inspection',
        description : '无损坏、无缺失',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '擦拭器组件-机械指/气缸组件',
        type : 'inspection',
        description : '无松动、无缺失、无漏气',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '擦拭器组件-主架螺栓',
        type : 'inspection',
        description : '紧固无松动、无缺失',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '擦拭器组件-水路接头',
        type : 'inspection',
        description : '无泄漏、无老化',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '擦拭器组件-胶帘',
        type : 'inspection',
        description : '胶帘无破损，固定螺栓无缺失、无松动',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '操作屏-界面',
        type : 'inspection',
        description : '操作灵敏，无报警信息',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '操作屏-设备电缆',
        type : 'inspection',
        description : '固定整洁，线缆保护层无破损、接头无松动、无损坏老化',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '操作屏-外表',
        type : 'inspection',
        description : '无损坏、无破损',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '入料皮带（北侧）-轴承（两块）',
        type : 'inspection',
        description : '润滑良好、无过度润滑、无异响',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '入料皮带（北侧）-主架螺栓',
        type : 'inspection',
        description : '紧固无松动、无缺失',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（北侧）-柜门',
        type : 'inspection',
        description : '柜门关严锁紧，密封良好无进水、内部卫生干净',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜（北侧）-开关、按钮',
        type : 'inspection',
        description : '接线无松动，线缆无变色',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      }
    ],
    personnel : [
      {
        participated : true,
        full_name : '马 艺晨',
        id : 98
      },
      {
        participated : false,
        full_name : '张 晓军',
        id : 99
      },
      {
        participated : false,
        full_name : '王 佩彦',
        id : 86
      },
      {
        participated : false,
        full_name : '马 旭康',
        id : 93
      }
    ],
    start_date : 1734969600000,
    end_date : null,
    created_at : 1734914639504,
    updated_at : 1735003034908,
    created_by : 86,
    updated_by : 98,
    module : 200,
    production_line_id : null,
    equipment_group_id : null,
    equipment_id : null,
    component_id : null,
    task_recurrence_id : '347241d4-baf0-4a40-bb31-535e40c93322',
    total_steps : null,
    completed_steps : null,
    template_id : '675111b89c81a65fc7766a00',
    state : 7
  },
  {
    _id : '20241223-T-1-2--884957',
    task_name : 'Inspect PEF',
    estimated_minutes : null,
    minutes_taken : null,
    work_order_id : 2994,
    steps : [
      {
        name : '输送机-网带 ',
        type : 'inspection',
        description : '无磨损、位置居中',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '输送机-接油盘',
        type : 'inspection',
        description : '无变形、无缺失、无润滑油',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '输送机-皮带刮板',
        type : 'inspection',
        description : '距离适中，可有效刮掉水渍及土豆。',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '输送机-皮带侧挡板',
        type : 'inspection',
        description : '皮带与挡板无摩擦，无破损',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '输送机-被动轴承',
        type : 'inspection',
        description : '润滑良好、无过度润滑、无异响',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '输送机-进/排水阀门',
        type : 'inspection',
        description : '无损坏，无漏水，无漏气、管路无漏水',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '输送机-网带支撑轮',
        type : 'inspection',
        description : '无损坏、转动灵活、轴承无生锈、无异响',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '电动机控制电柜-触摸屏',
        type : 'inspection',
        description :
          '1.水位保持在67±5cm左右 2.电导率：启机后逐渐稳定在1200左右（范围400-1300） 3.频率100-300Hz之间 4.电流　稳定在2500A以下 5.电导率超过1200后观察进／排水正常打开、关闭，进行换水',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电动机控制电柜-触摸屏下方各按钮',
        type : 'inspection',
        description : '无损坏，工作灯正常亮',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电动机控制电柜-柜门',
        type : 'inspection',
        description : '关严锁紧，密封无损坏',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电动机控制电柜-电柜下方格兰头',
        type : 'inspection',
        description : '备用电缆孔封堵严实，格兰头无松动，锁紧口处电缆无破皮',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14a24e5f102bec25cd28',
            name : '摸'
          }
        ]
      },
      {
        name : '电动机控制电柜-电源开关',
        type : 'inspection',
        description : '无损坏、表面无水渍',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '高压发生器-柜门',
        type : 'inspection',
        description : '关严锁紧，密封无损坏',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '高压发生器-电源开关',
        type : 'inspection',
        description : '无损坏、表面无水渍',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '高压发生器-触摸屏',
        type : 'inspection',
        description : '无损坏、触摸灵敏',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14a24e5f102bec25cd28',
            name : '摸'
          }
        ]
      },
      {
        name : '高压发生器-触摸屏下方各按钮',
        type : 'inspection',
        description : '无损坏，工作灯正常亮',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '油/水冷却系统-油泵',
        type : 'inspection',
        description : '无异响，无损坏，无漏油',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '油/水冷却系统-热交换器',
        type : 'inspection',
        description : '无损坏，无漏水，无漏油',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '油/水冷却系统-水压表',
        type : 'numeric_field',
        description : '指示压力0.6±0.2bar',
        required : true,
        remarks : null,
        value : {
          value : 0.7,
          has_lower_limit : true,
          lower_limit : 0.4,
          has_upper_limit : true,
          upper_limit : 0.8,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-恒温控制器',
        type : 'inspection',
        description : '无报警，温度应于设定值相近',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-风机',
        type : 'numeric_field',
        description : '无损坏、无异响、温度为30-50度',
        required : true,
        remarks : null,
        value : {
          value : 35,
          has_lower_limit : true,
          lower_limit : 30,
          has_upper_limit : true,
          upper_limit : 50,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '冷水机-进水／出水管路',
        type : 'inspection',
        description : '无漏水，管箍无生锈严重损坏',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-水泵电机',
        type : 'numeric_field',
        description : '无损坏、无异响、温度为30-50度',
        required : true,
        remarks : null,
        value : {
          value : 38,
          has_lower_limit : true,
          lower_limit : 30,
          has_upper_limit : true,
          upper_limit : 50,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-水泵压力表',
        type : 'numeric_field',
        description : '泵压应在应介于2.8-3.3bar',
        required : true,
        remarks : null,
        value : {
          value : 2.7,
          has_lower_limit : true,
          lower_limit : 2.8,
          has_upper_limit : true,
          upper_limit : 3.3,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-高压表',
        type : 'numeric_field',
        description : '检查压缩机高压是否正常，高压范围 1.0-2.0bar',
        required : true,
        remarks : null,
        value : {
          value : 1,
          has_lower_limit : true,
          lower_limit : 1,
          has_upper_limit : true,
          upper_limit : 2,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-低压表',
        type : 'numeric_field',
        description : '检查压缩机低压是否正常，低压范围 0.2-0.65bar',
        required : true,
        remarks : null,
        value : {
          value : 0.6,
          has_lower_limit : true,
          lower_limit : 0.2,
          has_upper_limit : true,
          upper_limit : 0.65,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-旁路阀',
        type : 'inspection',
        description : '无漏水，无生锈严重',
        required : true,
        remarks : '',
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      }
    ],
    personnel : [
      {
        participated : false,
        full_name : '马 艺晨',
        id : 98
      },
      {
        participated : false,
        full_name : '张 晓军',
        id : 99
      },
      {
        participated : false,
        full_name : '王 佩彦',
        id : 86
      },
      {
        participated : true,
        full_name : '马 旭康',
        id : 93
      }
    ],
    start_date : 1734969600000,
    end_date : null,
    created_at : 1734914638673,
    updated_at : 1734933261623,
    created_by : 86,
    updated_by : 93,
    module : 200,
    production_line_id : 2,
    equipment_group_id : 134,
    equipment_id : null,
    component_id : null,
    task_recurrence_id : 'db6901db-0823-4cb6-ad5a-cc8db06d3e1a',
    total_steps : null,
    completed_steps : null,
    template_id : '675a6ff179fb6728f03a576e',
    state : 12
  },
  {
    _id : '20241223-T-1-2--045936',
    task_name : 'Complete Daily Maintenance Checklist',
    estimated_minutes : null,
    minutes_taken : null,
    work_order_id : 2994,
    steps : [
      {
        name : '传送带-皮带',
        type : 'inspection',
        description :
          '运行平稳，上下皮带运行跑偏量≤10mm、无颤抖、粘料、下层皮带不得与积料摩擦 无磨损、无划伤、无穿孔、无撕裂、无龟裂 边缘整齐无毛边、磨损情况≤5mm 皮带凹槽与振筛凹槽对齐',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : ['http://mes.svf-lps.cn:9000/sv-file-bucket/20241223054615.jpg']
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-挡板',
        type : 'inspection',
        description : '无变形、无损坏，固定螺丝无缺失',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-轴承',
        type : 'inspection',
        description : '润滑良好、无过度润滑、无异响',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '传送带-轴承护罩',
        type : 'inspection',
        description : '无损坏，固定螺丝无松动缺失',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14a24e5f102bec25cd28',
            name : '摸'
          }
        ]
      },
      {
        name : '传送带-气接头、油嘴及打油管',
        type : 'inspection',
        description : '无损坏、无缺失，无漏油，油管固定好，不与转动部件摩擦',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-压缩空气管及气接头',
        type : 'inspection',
        description : '无漏气',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-气囊',
        type : 'inspection',
        description : '无损坏，无漏气',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-气囊间距调节螺栓',
        type : 'numeric_field',
        description : '螺栓外漏10-20mm',
        required : true,
        remarks : null,
        value : {
          value : 15,
          has_lower_limit : true,
          lower_limit : 10,
          has_upper_limit : true,
          upper_limit : 20,
          require_image : true,
          image : []
        },
        tools : [],
        methods : []
      },
      {
        name : '传送带-拨指架',
        type : 'inspection',
        description : '无损坏变形开焊，螺栓无缺失',
        required : true,
        remarks : '',
        value : {
          value : false,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-拨指',
        type : 'inspection',
        description : '与皮带无摩擦、碰撞，无缺失，拨指26根，距离皮带3-4mm，固定螺栓无松动，无缺失',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-毛刷',
        type : 'inspection',
        description : '高度1-2mm，调节手柄、定位插销牢固无缺失，毛刷不掉毛，不产生摩擦，电源接线盒密封良好无进水',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-水阀',
        type : 'inspection',
        description : '水管水阀无漏水，无损坏',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-喷头',
        type : 'inspection',
        description : '无堵塞，无损坏，无缺失',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-灯管',
        type : 'inspection',
        description : '无不亮',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-灯罩',
        type : 'inspection',
        description : '无损坏，无缺失，无严重划痕',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-皮带上方相机视窗',
        type : 'inspection',
        description : '无损坏，无脏污',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-电机温度',
        type : 'numeric_field',
        description : '温度≤65℃、无异响',
        required : true,
        remarks : null,
        value : {
          value : 45,
          has_lower_limit : false,
          lower_limit : null,
          has_upper_limit : true,
          upper_limit : 65,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '传送带-齿轮箱',
        type : 'numeric_field',
        description : '无异响、无漏油、温度≤65℃',
        required : true,
        remarks : null,
        value : {
          value : 52,
          has_lower_limit : false,
          lower_limit : null,
          has_upper_limit : true,
          upper_limit : 65,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '传送带-接油盘',
        type : 'inspection',
        description : '无变形、无缺失、无润滑油',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-刮板',
        type : 'inspection',
        description : '无损坏、磨损量≤2mm、刮板和固定螺丝无缺失，弹簧无缺失',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-机床滑板',
        type : 'inspection',
        description : '无损坏',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '传送带-皮带跑偏传感器',
        type : 'inspection',
        description : '与刮板距离合适，感应灵敏，能检测皮带跑偏',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜-操作屏',
        type : 'inspection',
        description : '无报警',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜-紧急停止按钮',
        type : 'inspection',
        description : '无损坏，接线无松动',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜-红绿双色按钮（带灯）',
        type : 'inspection',
        description : '无损坏，接线无松动',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜-复位按钮（带灯）',
        type : 'inspection',
        description : '无损坏，接线无松动',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜-主电源隔离开关',
        type : 'inspection',
        description : '无损坏，接线无松动',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-恒温控制器',
        type : 'inspection',
        description : '无报警，温度应于设定值相近',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : ['http://mes.svf-lps.cn:9000/sv-file-bucket/20241223054851.jpg']
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-风机',
        type : 'inspection',
        description : '无损坏、无异响、温度为30-50度',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-进水／出水管路',
        type : 'inspection',
        description : '无漏水，管箍无生锈严重损坏',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-水泵电机',
        type : 'inspection',
        description : '无损坏、无异响、温度为30-50度',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '冷水机-水泵压力表',
        type : 'numeric_field',
        description : '泵压应在应介于2.8-3.3bar',
        required : true,
        remarks : null,
        value : {
          value : 3,
          has_lower_limit : true,
          lower_limit : 2.8,
          has_upper_limit : true,
          upper_limit : 3.3,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-高压表',
        type : 'numeric_field',
        description : '检查压缩机高压是否正常，高压范围 1.0-2.0bar',
        required : true,
        remarks : null,
        value : {
          value : 1,
          has_lower_limit : true,
          lower_limit : 1,
          has_upper_limit : true,
          upper_limit : 2,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-低压表',
        type : 'numeric_field',
        description : '检查压缩机低压是否正常，低压范围 0.2-0.65bar',
        required : true,
        remarks : null,
        value : {
          value : 0.2,
          has_lower_limit : true,
          lower_limit : 0.2,
          has_upper_limit : true,
          upper_limit : 0.65,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '冷水机-旁路阀',
        type : 'inspection',
        description : '无漏水，无生锈严重',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      }
    ],
    personnel : [
      {
        participated : false,
        full_name : '马 艺晨',
        id : 98
      },
      {
        participated : false,
        full_name : '张 晓军',
        id : 99
      },
      {
        participated : false,
        full_name : '王 佩彦',
        id : 86
      },
      {
        participated : true,
        full_name : '马 旭康',
        id : 93
      }
    ],
    start_date : 1734969600000,
    end_date : null,
    created_at : 1734914639510,
    updated_at : 1734933020625,
    created_by : 86,
    updated_by : 93,
    module : 200,
    production_line_id : null,
    equipment_group_id : null,
    equipment_id : null,
    component_id : null,
    task_recurrence_id : 'd6b33bfd-9ab7-4f74-bfd1-848694085b9b',
    total_steps : null,
    completed_steps : null,
    template_id : '6762643a9d543e6ffb5c74f1',
    state : 12
  },
  {
    _id : '20241223-T-1-2--246126',
    task_name : '通用-5B光选机-JM016',
    estimated_minutes : null,
    minutes_taken : null,
    work_order_id : 2994,
    steps : [
      {
        name : '主皮带-电机温度',
        type : 'numeric_field',
        description : '温度≤65℃、无异响',
        required : true,
        remarks : null,
        value : {
          value : 55,
          has_lower_limit : false,
          lower_limit : null,
          has_upper_limit : true,
          upper_limit : 65,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '主皮带-齿轮箱',
        type : 'numeric_field',
        description : '无异响、无漏油、温度≤50℃',
        required : true,
        remarks : null,
        value : {
          value : 45,
          has_lower_limit : false,
          lower_limit : null,
          has_upper_limit : true,
          upper_limit : 50,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '主皮带-接油盘',
        type : 'inspection',
        description : '无变形、无缺失、无润滑油',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-驱动轴承',
        type : 'inspection',
        description : '润滑良好、无过度润滑、无异响',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '主皮带-皮带',
        type : 'inspection',
        description :
          '运行平稳，上下皮带运行跑偏量≤10mm、无颤抖 无磨损、无划伤、无穿孔、无撕裂 边缘整齐无毛边、磨损情况≤5mm',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-挡板',
        type : 'inspection',
        description : '不磨皮带，固定螺丝无缺失，挡皮无破损，刮板距离皮带高度3-4mm',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-与相邻设备距离',
        type : 'inspection',
        description : '无摩擦碰撞',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-主电源开关',
        type : 'inspection',
        description : '无损坏，表面无水渍',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-急停按钮',
        type : 'inspection',
        description : '无损坏，表面无水渍',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-喷射器',
        type : 'inspection',
        description : '听有无一直漏气的喷射器',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '主皮带-喷射器位置调节器',
        type : 'inspection',
        description : '"与原始刻度保持一致 西侧垂直方向刻度5.5水平方向刻度4.5 东侧垂直方向刻度5.5水平方向刻度4.5 "',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-分料滑槽',
        type : 'inspection',
        description : '"与原始刻度保持一致 西侧垂直方向刻度9水平方向刻度4 东侧垂直方向刻度9水平方向刻度4 "',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-皮带清洁刮板',
        type : 'inspection',
        description : '刮板无损坏、磨损量≤1mm、固定架螺丝无松动，无缺失，与皮带的涨紧度以能挂掉异物不能刮伤皮带',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-喷嘴',
        type : 'inspection',
        description : '喷水呈雾状、无堵塞',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-皮带内侧Ｖ字形刮板',
        type : 'inspection',
        description : '刮板无损坏、磨损量≤1mm、固定架螺丝无松动，无缺失，与皮带的涨紧度以能挂掉异物不能刮伤皮带',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '主皮带-地脚螺栓',
        type : 'inspection',
        description : '无松动、无缺失',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜-报警灯',
        type : 'inspection',
        description : '外观无损坏，无缺失',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : ['http://mes.svf-lps.cn:9000/sv-file-bucket/20241223054209.jpg']
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜-电柜与喷射单元连接线蓝色护套',
        type : 'inspection',
        description : '外观无损坏，护套两端接口锁紧',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14a24e5f102bec25cd28',
            name : '摸'
          }
        ]
      },
      {
        name : '电柜-触摸屏',
        type : 'inspection',
        description : '显示正常，无报警',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜-触摸屏下方的控制元件',
        type : 'inspection',
        description :
          '"1.分选机电源开关按钮无损坏 2.运动件开/关按钮无损坏 3.清洁模式按钮 无损坏 4.手动/自动开关　无损坏 5.重置按钮 - 蓝色，无损坏 6.备用位置无进水，无损坏 7.USB连接，盖子盖好，无损坏，无进水"',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '电柜-柜门',
        type : 'inspection',
        description : '柜门关严锁紧，密封良好无进水',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '水冷机-恒温控制器',
        type : 'inspection',
        description : '无报警，温度设定值相近',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '水冷机-风机',
        type : 'numeric_field',
        description : '无损坏、无异响、温度≤50℃',
        required : true,
        remarks : null,
        value : {
          value : 38,
          has_lower_limit : false,
          lower_limit : null,
          has_upper_limit : true,
          upper_limit : 50,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          },
          {
            _id : '673d14cd4e5f102bec25cd2a',
            name : '听'
          }
        ]
      },
      {
        name : '水冷机-水泵压力表',
        type : 'numeric_field',
        description : '泵压应在应介于3-4bar',
        required : true,
        remarks : null,
        value : {
          value : 3.5,
          has_lower_limit : true,
          lower_limit : 3,
          has_upper_limit : true,
          upper_limit : 4,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '水冷机-滤水器压力表',
        type : 'numeric_field',
        description : '压力≤1bar（10PSI）',
        required : true,
        remarks : null,
        value : {
          value : 0.6,
          has_lower_limit : true,
          lower_limit : 1,
          has_upper_limit : false,
          upper_limit : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '水冷机-水旁路阀门',
        type : 'inspection',
        description : '无漏水，无生锈',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '水冷机-冷凝器',
        type : 'inspection',
        description : '无漏水，无漏冷媒介质，无生锈',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      },
      {
        name : '水冷机-进水/出水管路',
        type : 'inspection',
        description : '无漏水，管箍无生锈',
        required : true,
        remarks : null,
        value : {
          value : true,
          remarks : null,
          require_image : true,
          image : []
        },
        tools : [],
        methods : [
          {
            _id : '673d149b4e5f102bec25cd27',
            name : '看'
          }
        ]
      }
    ],
    personnel : [
      {
        participated : false,
        full_name : '马 艺晨',
        id : 98
      },
      {
        participated : false,
        full_name : '张 晓军',
        id : 99
      },
      {
        participated : false,
        full_name : '王 佩彦',
        id : 86
      },
      {
        participated : true,
        full_name : '马 旭康',
        id : 93
      }
    ],
    start_date : 1734969600000,
    end_date : null,
    created_at : 1734914639498,
    updated_at : 1734932615011,
    created_by : 86,
    updated_by : 93,
    module : 200,
    production_line_id : null,
    equipment_group_id : null,
    equipment_id : null,
    component_id : null,
    task_recurrence_id : '91a7d019-a5b5-488d-bd49-b7a3f77bd52f',
    total_steps : null,
    completed_steps : null,
    template_id : '67625f049d543e6ffb5c74f0',
    state : 12
  }
]

const selectedTask = ref( null )

watch(
  () => woData.wo,
  () => {
    selectedTask.value = null
  }
)

function handleSelectedWorkorder() {
  router.push( { name : 'ViewWorkOrder', params : { id : woData.wo.id }} )
}

function selectTask( tIdx ) {
  selectedTask.value = tIdx
  console.log( selectedTask.value )
}

function handleCloseRequest( data ) {
  assignPersonnel.value = data
}

function handleAssign( num ) {
  listType.value = num
  assignPersonnel.value = true
}
</script>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  /* max-height: calc(100vh - v-bind(height)); */
  flex: 1;
}

.inner-container {
  overflow-y: auto;
  flex: 1;
  max-height: calc(100vh - 229px);
}

.header-container {
  display: flex;
  flex-direction: row;
  padding: 5px;
  justify-content: space-between;
}

.header-right {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.personnel-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 5px;
  flex: 1;
}

.card-shadow {
  box-shadow: var(--el-box-shadow-light);
  margin: 5px;
}

.card-header {
  font-weight: bold;
}

.card-body,
.personnel-card {
  display: flex;
  flex-direction: row;
  gap: 0.7rem;
  align-items: center;
  padding-left: 5px;
  margin-top: 10px;
}

.assign-button {
  margin-top: 25px;
}

.task-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 5px;
  justify-content: flex-start;
  flex: 1;
}

.task-card-body {
  display: flex;
  flex-direction: row;
  gap: 0.7rem;
  align-items: flex-start;
  padding-left: 5px;
  margin-top: 5px;
  justify-content: space-between;
}

.task-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
  flex: 1;
}

.task-card {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  align-items: center;
  padding-left: 5px;
  margin-top: 10px;
  cursor: pointer;
}

.task-card:hover,
.task-card .el-text:hover {
  color: cornflowerblue;
}

.steps-card {
  display: flex;
  flex-direction: column;
  flex: 1 1 10vw;
  margin: 0;
  margin-top: 5px;
}

.step-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(25%, 1fr));
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
  /* background-color: #f5f5f5; */
}

.step-card {
  padding: 8px 12px;
  border-radius: 6px;
  white-space: normal;
  background-color: white;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-overflow: ellipsis;
  word-wrap: break-word;
}

.step-header {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.step-header hr {
  width: 100%;
  border: none;
  border-top: 1px solid #ccc;
  margin: 8px 0;
}

.minus-style {
  cursor: pointer;
}

.step-superscript {
  font-size: 14px;
  color: darkgray;
}

.selected-style {
  color: cornflowerblue;
  font-size: 18px;
}

.unselected-style {
  font-size: 16px;
}

@media (max-width: 1600px) {
  .view-container {
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    flex: 1;
    /* max-height: calc(100vh - 140px); */
  }

  .inner-container {
    overflow-y: auto;
    flex: 1;
    margin: 0;
    max-height: calc(100vh - 228px);
  }

  .header-container {
    display: flex;
    flex-direction: row;
    padding: 5px;
  }

  .header-right {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .personnel-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 5px;
  }

  .card-shadow {
    box-shadow: var(--el-box-shadow-light);
    margin: 5px;
  }

  .card-header {
    font-weight: bold;
  }

  .card-body,
  .personnel-card {
    display: flex;
    flex-direction: row;
    gap: 0.3rem;
    align-items: center;
    padding-left: 5px;
    margin-top: 5px;
  }

  .assign-button {
    margin-top: 15px;
  }

  .task-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 5px;
    justify-content: flex-start;
  }

  .task-card-body {
    display: flex;
    flex-direction: row;
    gap: 0.7rem;
    align-items: flex-start;
    padding-left: 5px;
    margin-top: 5px;
    justify-content: space-between;
  }

  .task-list {
    list-style: none;
    padding-left: 0;
    margin: 0;
    flex: 1;
  }

  .step-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40%, 1fr));
    gap: 12px;
    padding: 0;
    margin: 0;
    list-style: none;
    /* background-color: #f5f5f5; */
  }

  .step-card {
    padding: 8px 12px;
    border-radius: 6px;
    white-space: normal;
    background-color: white;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    text-overflow: ellipsis;
    word-wrap: break-word;
  }

  .task-card {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;
    padding-left: 5px;
    margin-top: 10px;
    cursor: pointer;
  }

  .task-card:hover,
  .task-card .el-text:hover {
    color: cornflowerblue;
  }

  .steps-card {
    display: flex;
    flex-direction: column;
    flex: 1 1 8vw;
    margin: 0;
  }

  .step-header {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .step-header hr {
    width: 100%;
    border: none;
    border-top: 1px solid #ccc;
    margin: 8px 0;
  }

  .selected-style {
    color: cornflowerblue;
    font-size: 14px;
  }

  .unselected-style {
    font-size: 12px;
  }
}
</style>
