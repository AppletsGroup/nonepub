import { Fragment, Slice, Node as PMNode } from 'prosemirror-model'
import { Step, StepResult, Mappable } from 'prosemirror-transform'

// https://discuss.prosemirror.net/t/preventing-image-placeholder-replacement-from-being-undone/1394
export class SetAttrsStep<Attrs = any> extends Step {
  constructor(public pos: number, public attrs: Attrs) {
    super()
  }

  apply(doc: PMNode): StepResult {
    const target = doc.nodeAt(this.pos)
    if (!target) {
      return StepResult.fail('No node at given position')
    }
    const newNode = target.type.create(this.attrs, Fragment.empty, target.marks)
    const slice = new Slice(Fragment.from(newNode), 0, target.isLeaf ? 0 : 1)
    return StepResult.fromReplace(doc, this.pos, this.pos + 1, slice)
  }

  invert(doc: PMNode): Step {
    const target = doc.nodeAt(this.pos)
    return new SetAttrsStep(this.pos, target ? target.attrs : null)
  }

  map(mapping: Mappable): Step | null | undefined {
    let result = mapping.mapResult(this.pos, 1)
    return result.deleted ? null : new SetAttrsStep(result.pos, this.attrs)
  }

  toJSON() {
    return { stepType: 'setAttrs', pos: this.pos, attrs: this.attrs }
  }

  static fromJSON(schema: any, json: { [k: string]: any }) {
    if (
      typeof json.pos !== 'number' ||
      (json.attrs != null && typeof json.attrs !== 'object')
    ) {
      new RangeError('INvalid input for SetAttrsStep.fromJSON')
    }
    return new SetAttrsStep(json.pos, json.attrs)
  }
}

Step.jsonID('setAttrs', SetAttrsStep)
