import { Affix, Button, Card, Col, Divider, Form, Input, Layout, Radio, Row, Space, Spin, Steps, Typography } from 'antd';
import { Rule } from 'antd/lib/form';
import { FormLayout } from 'antd/lib/form/Form';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import './App.css';

type FormSectionItemType = "input";
type FormSectionItemInputType =
  "text"
  | "textarea"
  | "radio"
  ;

interface FormSectionItem {
  type: FormSectionItemType;
  inputType?: FormSectionItemInputType;
  inputName?: string;
  inputPlaceholder?: string;
  inputLabel?: string;
  inputValidationRules?: Rule[];
  radioOptions?: {
    label: string;
    value: string;
  }[];
}

interface FormSection {
  id: string;
  layout?: FormLayout;
  title?: string;
  items: FormSectionItem[];
}

interface FormStep {
  id: string;
  name: string;
  description?: string;
  sections: FormSection[];
}

interface FormSchema {
  steps: FormStep[];
}

const schema: FormSchema = {
  steps: [
    {
      id: "step-1",
      name: "Step 1",
      description: "This is the first step",
      sections: [
        {
          id: "sample1",
          title: "Form section #1",
          items: [
            {
              type: "input",
              inputName: "text1",
              inputType: "text",
              inputLabel: "This is the input label",
              inputPlaceholder: "Enter some text here",
              inputValidationRules: [
                {
                  validator: async (rule, value, callback) => {
                    await new Promise(r => setTimeout(r, 3000));
                    if (value !== "correct") {
                      throw new Error("This isn't correct");
                    }
                  }
                }
              ]
            },
            {
              type: "input",
              inputName: "textarea1",
              inputType: "textarea",
              inputLabel: "Something a little longer",
              inputPlaceholder: "Enter whatever you want"
            },
            {
              type: "input",
              inputName: "selector",
              inputType: "radio",
              inputLabel: "Choose one",
              radioOptions: [
                { label: "one", value: "1" },
                { label: "two", value: "2" },
                { label: "three", value: "3" }
              ]
            }

          ]
        },
        {
          id: "sample2",
          title: "Form section #2",
          items: [
            {
              type: "input",
              inputName: "text2",
              inputType: "text",
              inputLabel: "This is the input label",
              inputPlaceholder: "Enter some text here",
              inputValidationRules: [
                {
                  required: true
                }
              ]
            },
            {
              type: "input",
              inputName: "selector2",
              inputType: "radio",
              inputLabel: "Choose two",
              radioOptions: [
                { label: "one1", value: "1" },
                { label: "two2", value: "2" },
                { label: "three3", value: "3" }
              ]
            }
          ]
        },
      ]
    },
    {
      id: "step-2",
      name: "Step 2",
      sections: [
        {
          id: "sample3",
          title: "Form section #3",
          items: [
            {
              type: "input",
              inputName: "text2",
              inputType: "text",
              inputLabel: "This is the input label",
              inputPlaceholder: "Enter some text here",
              inputValidationRules: [
                {
                  required: true
                }
              ]
            },
            {
              type: "input",
              inputName: "selector2",
              inputType: "radio",
              inputLabel: "Choose two",
              radioOptions: [
                { label: "one1", value: "1" },
                { label: "two2", value: "2" },
                { label: "three3", value: "3" }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const DynamicFormSectionItem = (props: { item: FormSectionItem }) => {
  const { item } = props;

  const filterRules = (rules?: Rule[]): Rule[] => {
    if (!rules) {
      return [];
    }

    return rules.map(rule => ({
      ...rule,
      validateTrigger: "onSubmit"
    }));
  }

  if (item.type === "input" && item.inputType === "text") {
    return (
      <Form.Item label={item.inputLabel} name={item.inputName} rules={filterRules(item.inputValidationRules)}>
        <Input placeholder={item.inputPlaceholder} />
      </Form.Item>
    )
  }

  if (item.type === "input" && item.inputType === "textarea") {
    return (
      <Form.Item label={item.inputLabel} name={item.inputName} rules={filterRules(item.inputValidationRules)}>
        <Input.TextArea placeholder={item.inputPlaceholder} />
      </Form.Item>
    )
  }

  if (item.type === "input" && item.inputType === "radio") {
    return (
      <Form.Item label={item.inputLabel} name={item.inputName} rules={filterRules(item.inputValidationRules)}>
        <Radio.Group >
          <Space direction="vertical" size="small">
            {item.radioOptions?.map(x => (
              <Radio value={x.value}>{x.label}</Radio>
            ))}
          </Space>
        </Radio.Group>
      </Form.Item>
    )
  }


  return null;
}

const DynamicFormSection = forwardRef((props: { section: FormSection }, ref) => {
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    getSectionData: async () => {
      try {
        await form.validateFields();
        return form.getFieldsValue();
      } catch (err) {
        if (err.errorFields) {
          return { errors: err.errorFields }
        } else
          return err;
      }
    }
  }));

  return (
    <Card>
      {props.section.title && <Typography.Title level={5}>{props.section.title}</Typography.Title>}
      <Form size="small" form={form} layout={props.section.layout ?? "vertical"}>
        {props.section.items.map((item, idx) => (
          <DynamicFormSectionItem key={idx} item={item} />
        ))}
      </Form>
    </Card>
  );
});

const DynamicFormStep = (props: { step: FormStep, onData: (data: any, error?: any) => void }) => {
  const sectionRefs: any = {};
  const [processing, setProcessing] = useState<boolean>(false);

  const getStepData = async () => {
    const stepData: any = {};
    for (const section of props.step.sections) {
      if (section.id in sectionRefs) {
        stepData[section.id] = await sectionRefs[section.id].getSectionData();
      }
    }

    return stepData;
  }

  const submitClick = async () => {
    setProcessing(true);
    const stepData = await getStepData();
    stepData.errors ? props.onData(stepData) : props.onData(null, stepData);
    setProcessing(false);
  }

  return (
    <Space style={{ width: '100%' }} direction="vertical" size="large">
      <Spin spinning={processing} delay={250} tip="Please, wait...">
        <Space style={{ width: '100%' }} direction="vertical" size="large">
          {props.step.sections.map((section, idx) => (
            <DynamicFormSection ref={(ref) => { if (ref) { sectionRefs[section.id] = ref; } }} key={section.id} section={section} />
          ))}
        </Space>
      </Spin>
      <Button onClick={submitClick}>Submit</Button>
    </Space>
  )
}

const DynamicForm = (props: { onUpdate: (data: any) => void }) => {
  const [data, setData] = useState<any>({});

  const updateData = (stepId: string, stepData: any, error: any) => {
    const update = { ...data };
    if (error) {
      update[`${stepId}`] = error;
    } else if (stepData) {
      update[`${stepId}`] = stepData;
    } else {
      update[`${stepId}`] = { error: "empty data" };
    }
    setData(update);

    props.onUpdate(update);
  }

  return (
    <Card>
      <Row gutter={3}>

        <Col span={6}>
          <Steps size="small" onChange={() => { }} current={0} direction="vertical">
            {schema.steps.map(step => (
              <Steps.Step title={step.name} description={step.description} />
            ))}
            <Steps.Step status="wait" disabled title="Review" description="Review all information for this submission" />
          </Steps>
        </Col>
        <Col span={18}>
          {schema.steps.map((step, idx) => (
            <DynamicFormStep key={step.id} step={step} onData={(stepData, err) => updateData(step.id, stepData, err)} />
          ))}
        </Col>

      </Row>
    </Card>
  )
}

function App() {
  const [formData, setFormData] = useState<any>({});
  return (
    <Layout style={{ flex: 1 }}>
      <Layout.Content style={{ flex: 1, padding: 50 }}>
        <Typography.Title>Dynamic form</Typography.Title>
        <div style={{ width: 1000, margin: 'auto' }}>
          <DynamicForm onUpdate={data => setFormData(data)} />
        </div>
        <pre style={{ flex: 1 }}>{JSON.stringify(formData, null, 2)}</pre>
      </Layout.Content>
    </Layout>
  );
}

export default App;
