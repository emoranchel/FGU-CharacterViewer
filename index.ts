/* ***********************************
* Entrypoint for character viewer
** ***********************************/

const statBlockStr = `
<table>
</table>
`

interface AbilityStat {
  name: string;
  value: string;
  modifier: string;
  save: string;
  prof: string;
  toRow: () => string;
}

function loadData(doc: XMLDocument, element: JQuery) {
  let xml = $(doc);
  let character = $(doc).find('character')
  let abilities = character.find('abilities');
  let characterElement = $('<div>');
  let skills = character.find('> skilllist').children();

  characterElement.append($(`<h1>${character.find('>name').text()}</h1>`))
  characterElement.append(toRaceClassBlock(character));
  characterElement.append(toOverviewBlock(character));
  characterElement.append(toHPBlock(character));
  characterElement.append(toAbilityBlock(abilities));
  characterElement.append(toSkillBlock(skills));
  characterElement.append(toProficienciesBlock(character));
  characterElement.append(toTraitsBlock(character));
  characterElement.append(toFeaturesBlock(character));
  characterElement.append(toFeatsBlock(character));
  characterElement.append(toWeaponsBlock(character));
  characterElement.append(toSpellsAndPowersBlock(character));
  characterElement.append(toDetailsBlock(character));

  element.append(characterElement);
}

function toRaceClassBlock(character: JQuery<HTMLElement>): JQuery {
  let block = $('<p>')
    .append('Race: ')
    .append(valueSpan(character, 'race', null, {
      content: character.find('racelink recordname').text()
    }))
    .append('<br/>Classes: ');
  character.find('classes').children().each((i, e) => {
    let clazz = $(e);
    let clazzElem = $('<span title="">')
    clazzElem.append(`${clazz.find('name').text()} (${clazz.find('level').text()})`);
    clazzElem.tooltip({
      content: `Hit Die: ${clazz.find('hddie').text()}<br/>${clazz.find('shortcut recordname').text()}`
    });
    block.append(clazzElem);
  });
  block.append('<br/>Background: ')
    .append(valueSpan(character, 'background', null, {
      content: character.find('backgroundlink recordname').text()
    }));
  return block;
}

function toAbilityBlock(abilities: JQuery<HTMLElement>): string {
  return `
<p>Abilities
<table cellpadding="5" cellspacing="0">
  <thead>
    <tr>
      <th>Ability</th>
      <th>Value</th>
      <th>Modifier</th>
      <th>Save</th>
      <th>&nbsp;</th>
    </tr>
  </thead>
  <tbody>
  ${toAbility(abilities.find('>strength'))}
  ${toAbility(abilities.find('>dexterity'))}
  ${toAbility(abilities.find('>constitution'))}
  ${toAbility(abilities.find('>intelligence'))}
  ${toAbility(abilities.find('>wisdom'))}
  ${toAbility(abilities.find('>charisma'))}
  </tbody>
</table> 
</p>`
}

function toAbility(ability: JQuery<HTMLElement>): string {
  let modifier = ability.find('>bonus').text();
  if (parseInt(modifier) > 0) {
    modifier = '+' + modifier;
  }
  let saveModifier = ability.find('>saveModifier').text();
  if (parseInt(saveModifier) > 0) {
    saveModifier = '+' + saveModifier;
  }
  let prof = `<input type="checkbox" ${ability.find('>saveProf').text() == '1' ? 'checked' : ''} disabled/>`;
  return `
<tr>
<td>${ability[0].nodeName}</td>
<td>${ability.find('>score').text()}</td>
<td>${modifier}</td>
<td>${saveModifier}</td>
<td>${prof}</td>
</tr>`;
}

function toOverviewBlock(character: JQuery<HTMLElement>): JQuery {
  return $('<p>')
    .append('Proficiency bonus: +' + character.find('profbonus').text())
    .append('<br/>Armor class: ')
    .append(valueSpan(character, 'defenses ac total', 'Armor Class', {
      content: flatList(character, 'defenses ac')
    }))
    .append('<br>Initiative: ')
    .append(valueSpan(character, 'initiative total', 'Initiative', {
      content: flatList(character, 'initiative')
    }))
    .append('<br>Speed: ')
    .append(valueSpan(character, 'speed total', 'Speed', {
      content: flatList(character, 'speed')
    }))
    .append('<br>Size: ')
    .append(valueSpan(character, 'size'))
    .append('<br>Passive perception: ')
    .append(valueSpan(character, 'perception', 'Perception modifier', {
      content: 'Perception modifier: ' + character.find('perceptionmodifier').text()
    }))
    .append('<br>Senses: ')
    .append(valueSpan(character, 'senses'));
}

function toHPBlock(character: JQuery<HTMLElement>): JQuery {
  return $('<p>')
    .append('HP:')
    .append(valueSpan(character, 'hp total', 'HP', {
      content: character.find('hp').children().toArray().map((h) => h.nodeName + ": " + h.innerHTML).join('<br/>')
    }));
}

function toSkillBlock(skills: JQuery<HTMLElement>): JQuery {
  let skillTable = `
  <table cellpadding="5" cellspacing="0">
  <thead>
    <tr>
      <th>Skill</th>
      <th>Ability</th>
      <th>Prof</th>
      <th>Misc</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
  `;
  skillTable += skills.map((i, e) => {
    let skElem = $(e);
    return `<tr>
  <td>${skElem.find('name').text()}</td>
  <td>${skElem.find('stat').text().substring(0, 3)}</td>
  <td><input type="checkbox" ${skElem.find('prof').text() == '1' ? 'checked' : ''} disabled /></td>
  <td>${skElem.find('misc').text()}</td>
  <td>${skElem.find('total').text()}</td>
</tr>`;
  }).toArray().sort().join('');
  skillTable += `  
  </tbody>
</table>`
  return $('<p>')
    .append('Skills')
    .append(skillTable);
}

function toProficienciesBlock(character: JQuery<HTMLElement>): JQuery {
  let profList = $('<ul>');
  let langs = $('<ul>');
  character.find('proficiencylist').find('name').each((i, e) => {
    profList.append('<li>' + $(e).text() + '</li>');
  });
  character.find('languagelist').find('name').each((i, e) => {
    langs.append('<li>' + $(e).text() + '</li>');
  });
  return $('<p>')
    .append('Proficiencies:')
    .append(profList)
    .append('Languages')
    .append(langs);
}

function toTraitsBlock(character: JQuery<HTMLElement>): JQuery {
  let list = $('<ul>');
  character.find('traitlist').children().each((i, e) => {
    let t = $(e);
    list.append($('<li>')
      .append('[' + t.find('type').text() + ' ' + t.find('source').text() + '] ')
      .append(valueSpan(t, 'name', null, {
        content: t.find('text').html()
      }))
    );
  });
  return $('<p>').append('Traits:').append(list);
}

function toFeaturesBlock(character: JQuery<HTMLElement>): JQuery {
  let list = $('<ul>');
  character.find('featurelist').children().each((i, e) => {
    let t = $(e);
    list.append($('<li>')
      .append('[' + t.find('source').text() + ' ' + t.find('level').text() + '] ')
      .append(valueSpan(t, 'name', null, {
        content: t.find('text').html()
      }))
    );
  });
  return $('<p>').append('Features:').append(list);
}

function toFeatsBlock(character: JQuery<HTMLElement>): JQuery {
  let list = $('<ul>');
  character.find('featlist').children().each((i, e) => {
    let t = $(e);
    list.append($('<li>')
      .append(valueSpan(t, 'name', null, {
        content: t.find('text').html()
      }))
    );
  });
  return $('<p>').append('Feats:').append(list);
}

function toWeaponsBlock(character: JQuery<HTMLElement>): JQuery {
  let list = $('<ul>');
  character.find('weaponlist').children().each((i, e) => {
    let t = $(e);
    let wpnDesc = `
- Weapon properties only, actual attack needs to add character bonuses --
<p class="statblock">Attack: ${t.find('attackbonus').text()}<br/>
Damage</p><ul>`
    t.find('damagelist').children().each((i, el) => {
      let dam = $(el);
      wpnDesc += `<li class="statblock">${dam.find('type').text()} ${dam.find('dice').text()}+${dam.find('stat').text()}+${dam.find('bonus').text()}</li>`
    });
    wpnDesc += `</ul>
<p class="statblock">
Properties: ${t.find('properties').text()}<br/>
Proficient: <input type="checkbox" ${t.find('prof').text() == '1' ? 'checked' : ''} disabled /></p>
    `

    list.append($('<li>')
      .append(valueSpan(t, 'name', null, {
        content: wpnDesc
      }))
    );
  });
  return $('<p>').append('Weapons:').append(list);
}

interface PowerDetail {
  name: string;

  castingTime: string;
  components: string;
  range: string;
  duration: string;
  ritual: boolean;

  description: string;
  school: string;
  source: string;
}

function toSpellsAndPowersBlock(character: JQuery<HTMLElement>): JQuery {
  let groups: { [key: string]: PowerDetail[][] } = {};
  character.find('powers').children().each((i, p) => {
    let pow = $(p);
    let groupId = pow.find('group').text();
    let group = groups[groupId];
    if (!group) {
      group = [];
      groups[groupId] = group;
    }
    let level = parseInt(pow.find('level').text());
    let levelGroup = group[level];
    if (!levelGroup) {
      levelGroup = [];
      group[level] = levelGroup;
    }
    group[level].push({
      name: pow.find('name').text(),

      castingTime: pow.find('castingtime').text(),
      components: pow.find('components').text(),
      range: pow.find('range').text(),
      duration: pow.find('duration').text(),
      ritual: pow.find('number').text() == '1',

      description: pow.find('description').html(),
      school: pow.find('school').text(),
      source: pow.find('source').text(),

    });
  });
  let list = $('<ul>');
  Object.keys(groups).forEach((powGroup: string) => {
    let powGroupList = $('<ul>');
    Object.keys(groups[powGroup]).sort().forEach((level: string) => {
      let levelList = $('<ul>');
      groups[powGroup][level].forEach((power: PowerDetail) => {
        let detail = `
<p class="statblock">
  Casting time: ${power.castingTime}<br/>
  Components: ${power.components}<br/>
  Range: ${power.range}<br/>
  Duration: ${power.duration}<br/>
  Ritual: <input type="checkbox" ${power.castingTime ? 'checked' : ''} disabled />
</p>
<div>${power.description}</div>
<p>
  School: ${power.school}
  Source: ${power.source}
</p>
`;
        levelList.append($('<li>').append(tooltipSpan(power.name, detail)));
      });;
      powGroupList.append($('<li>').append('Level ' + level).append(levelList));
    });
    list.append($('<li>').append(powGroup).append(powGroupList));
  });
  return $('<p>').append('Spells and powers:').append(list);
}

function toDetailsBlock(character: JQuery<HTMLElement>): JQuery {
  return $('<p>Description:')
    .append($('<div class="charDetails">')
      .append('<b>Gender</b>: ')
      .append(character.find('gender').text())
      .append('<br/><b>Age</b>: ')
      .append(character.find('age').text())
      .append('<br/><b>Height</b>: ')
      .append(character.find('height').text())
      .append('<br/><b>Weight</b>: ')
      .append(character.find('weight').text())
      .append('<br/><b>Size</b>: ')
      .append(character.find('size').text())
      .append('<br/><b>Alignment</b>: ')
      .append(character.find('alignment').text())
      .append('<br/><b>Deity</b>: ')
      .append(character.find('deity').text())
      .append('<br/><b>Personality traits</b>: ')
      .append(character.find('personalitytraits').text())
      .append('<br/><b>Ideals</b>: ')
      .append(character.find('ideals').text())
      .append('<br/><b>Bonds</b>: ')
      .append(character.find('bonds').text())
      .append('<br/><b>Flaws</b>: ')
      .append(character.find('flaws').text())
      .append('<br/><b>Appearance</b>: ')
      .append(character.find('appearance').text())
      .append('<br/><b>Notes</b>: ')
      .append(character.find('notes').text())
    );

}

function valueSpan(node: JQuery<HTMLElement>, path: string, title?: string, tooltipOpts?: JQueryUI.TooltipOptions): JQuery {
  let valueText = node.find(path).text();
  let e = $('<span title="">').append(valueText);
  if (tooltipOpts) {
    e.tooltip(tooltipOpts);
    let dialog = $('<div>').append(tooltipOpts.content).dialog({
      minWidth: 600,
      maxWidth: 1600,
      autoOpen: false,
      title: (title ? title + ' ' : '') + valueText
    });
    e.on('click', () => {
      dialog.dialog('open');
    });
  }
  return e;
}

function tooltipSpan(title: string, detail: string) {
  let dialog = $('<div>').append(detail).dialog({
    minWidth: 600,
    maxWidth: 1600,
    autoOpen: false,
    title: title
  });
  return $('<span title="">').append(title).tooltip({
    content: detail
  }).on('click', () => {
    dialog.dialog('open');
  });
}

function flatList(node: JQuery<HTMLElement>, path: string): string {
  return node.find(path).children().toArray().map((h) => h.nodeName + ": " + h.innerHTML).join('<br/>')
}

